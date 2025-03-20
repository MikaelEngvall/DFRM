package com.dfrm.filter;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dfrm.model.User;
import com.dfrm.repository.UserRepository;
import com.dfrm.service.JwtService;
import com.dfrm.service.TokenDecryptionService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final TokenDecryptionService tokenDecryptionService;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final Environment environment;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/") || 
               path.startsWith("/api/security/") ||
               path.equals("/api/pending-tasks/check-emails") || 
               path.equals("/api/interests/check-emails");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        log.info("Bearbetar token: {}", token.substring(0, Math.min(token.length(), 20)) + "...");
        
        // Kontrollera om token är krypterad
        if (tokenDecryptionService.isEncryptedToken(token)) {
            log.info("Identifierade krypterad token - försöker dekryptera");
            
            String decryptedToken = tokenDecryptionService.decryptToken(token);
            
            if (decryptedToken != null) {
                log.info("Dekryptering lyckades - använder dekrypterad token");
                processJwtToken(request, decryptedToken);
            } else {
                log.warn("Dekryptering misslyckades - försöker med alternativ metod");
                handleEncryptedToken(request, response, filterChain, token);
            }
        } else {
            // Originallogik för okrypterad token
            processJwtToken(request, token);
        }

        filterChain.doFilter(request, response);
    }
    
    private void processJwtToken(HttpServletRequest request, String token) {
        String userEmail = null;
        try {
            userEmail = jwtService.extractUsername(token);
        } catch (Exception e) {
            log.warn("Kunde inte extrahera användarnamn från token: {}", e.getMessage());
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            
            if (jwtService.validateToken(token, userDetails.getUsername())) {
                Collection<SimpleGrantedAuthority> authorities = extractAuthorities(token);
                
                if (authorities.isEmpty()) {
                    log.warn("Inga behörigheter hittades i JWT-token. Använder behörigheter från UserDetails.");
                    authorities = userDetails.getAuthorities().stream()
                        .map(auth -> new SimpleGrantedAuthority(auth.getAuthority()))
                        .collect(Collectors.toList());
                }
                
                log.info("Användarroller för {}: {}", userEmail, 
                    authorities.stream().map(Object::toString).collect(Collectors.joining(", ")));
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    authorities
                );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
    }
    
    private void handleEncryptedToken(
            HttpServletRequest request, 
            HttpServletResponse response, 
            FilterChain filterChain,
            String encryptedToken) throws ServletException, IOException {
        
        try {
            // Försök hitta email från request eller cookies
            String userEmail = extractUserEmailFromRequest(request);
            
            if (userEmail == null || userEmail.isEmpty()) {
                log.warn("Kunde inte extrahera användarens email från request");
                return;
            }
            
            log.info("Hittade användarens email: {}", userEmail);
            
            // Hämta användaren direkt från repository för att få roll
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            
            if (userOpt.isEmpty()) {
                log.warn("Kunde inte hitta användare med email: {}", userEmail);
                return;
            }
            
            User user = userOpt.get();
            log.info("Hittade användare: {}, roll: {}", user.getEmail(), user.getRole());
            
            // Använd UserDetailsService för att få UserDetails
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            
            // Skapa manuellt authorities baserat på användarens roll
            List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority(user.getRole()),
                new SimpleGrantedAuthority(user.getRole().startsWith("ROLE_") ? 
                    user.getRole() : "ROLE_" + user.getRole())
            );
            
            log.info("Sätter manuellt behörigheter för {}: {}", 
                user.getEmail(), 
                authorities.stream().map(Object::toString).collect(Collectors.joining(", ")));
            
            // Skapa authentication token
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                authorities
            );
            
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            
        } catch (Exception e) {
            log.error("Fel vid hantering av krypterad token: {}", e.getMessage(), e);
        }
    }
    
    private String extractUserEmailFromRequest(HttpServletRequest request) {
        // 1. Försök med request parameter
        String userEmail = request.getParameter("userEmail");
        if (userEmail != null && !userEmail.isEmpty()) {
            return userEmail;
        }
        
        // 2. Försök med cookies
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("userEmail".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        // 3. Försök extrahera email från URL mönster om det finns med
        String requestURI = request.getRequestURI();
        String[] segments = requestURI.split("/");
        for (String segment : segments) {
            if (segment.contains("@")) {
                return segment;
            }
        }
        
        // 4. Kolla om någon tidigare authentication finns
        Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
        if (existingAuth != null && existingAuth.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) existingAuth.getPrincipal()).getUsername();
        }
        
        // 5. Som en sista utväg, extrahera från en parameter med annat namn?
        for (String paramName : Collections.list(request.getParameterNames())) {
            String value = request.getParameter(paramName);
            if (value != null && value.contains("@")) {
                return value;
            }
        }
        
        // 6. Kolla begäranuppsättningen
        Object userAttr = request.getAttribute("user");
        if (userAttr instanceof String && ((String) userAttr).contains("@")) {
            return (String) userAttr;
        }
        
        return null;
    }
    
    private Collection<SimpleGrantedAuthority> extractAuthorities(String token) {
        try {
            Claims claims = jwtService.extractAllClaims(token);
            Object roleObj = claims.get("role");
            
            if (roleObj != null) {
                String role = roleObj.toString();
                log.info("Extraherade roll från token: {}", role);
                
                Collection<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                
                // Lägg till både med och utan ROLE_-prefix för kompatibilitet
                if (role.startsWith("ROLE_")) {
                    authorities.add(new SimpleGrantedAuthority(role));
                    authorities.add(new SimpleGrantedAuthority(role.substring(5)));
                } else {
                    authorities.add(new SimpleGrantedAuthority(role));
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                }
                
                return authorities;
            } else {
                log.warn("Ingen roll hittades i JWT-token");
            }
        } catch (Exception e) {
            log.warn("Kunde inte extrahera roller från token", e);
        }
        
        return Collections.emptyList();
    }
    
    private boolean isDevEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("dev".equals(profile)) {
                return true;
            }
        }
        return false;
    }
} 
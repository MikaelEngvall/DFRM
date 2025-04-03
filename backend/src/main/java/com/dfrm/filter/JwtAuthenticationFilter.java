package com.dfrm.filter;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

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

        try {
            final String token = authHeader.substring(7);
            
            if (token == null || token.trim().isEmpty()) {
                log.warn("Tom token detekterad");
                sendUnauthorizedResponse(response, "Ogiltig token");
                return;
            }
            
            // Kontrollera om token är krypterad
            if (tokenDecryptionService.isEncryptedToken(token)) {
                processEncryptedToken(request, response, token);
            } else {
                // Originallogik för okrypterad token
                processJwtToken(request, response, token);
            }
        } catch (Exception e) {
            log.error("Oväntat fel vid tokenhantering", e);
            sendUnauthorizedResponse(response, "Autentiseringsfel");
            return;
        }

        filterChain.doFilter(request, response);
    }
    
    private void processEncryptedToken(HttpServletRequest request, HttpServletResponse response, String token) throws IOException {
        String decryptedToken = tokenDecryptionService.decryptToken(token);
        
        if (decryptedToken != null && !decryptedToken.trim().isEmpty()) {
            // Använd dekrypterad token för autentisering
            processJwtToken(request, response, decryptedToken);
        } else {
            // Dekryptering misslyckades, token är ogiltig
            log.warn("Dekryptering av token misslyckades");
            sendUnauthorizedResponse(response, "Ogiltig token");
        }
    }
    
    private void processJwtToken(HttpServletRequest request, HttpServletResponse response, String token) throws IOException {
        try {
            String userEmail = jwtService.extractUsername(token);
            
            if (userEmail == null || userEmail.trim().isEmpty()) {
                log.warn("Ingen användare i token");
                sendUnauthorizedResponse(response, "Ogiltig token");
                return;
            }
            
            // Validera att användaren existerar
            if (!userRepository.existsByEmail(userEmail)) {
                log.warn("Användare hittades inte: {}", userEmail);
                sendUnauthorizedResponse(response, "Okänd användare");
                return;
            }
            
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.validateToken(token, userDetails.getUsername())) {
                    // Extrahera behörigheter från token
                    Collection<SimpleGrantedAuthority> authorities = extractAuthorities(token);
                    
                    if (authorities.isEmpty()) {
                        // Använd behörigheter från UserDetails som en fallback
                        authorities = userDetails.getAuthorities().stream()
                            .map(auth -> new SimpleGrantedAuthority(auth.getAuthority()))
                            .collect(Collectors.toList());
                        
                        // Om fortfarande inga behörigheter, detta är ett säkerhetsproblem
                        if (authorities.isEmpty()) {
                            log.error("Användare utan behörigheter: {}", userEmail);
                            sendUnauthorizedResponse(response, "Otillräckliga behörigheter");
                            return;
                        }
                    }
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities
                    );
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Autentisering lyckades för användare: {}", userEmail);
                } else {
                    log.warn("Token validering misslyckades för användare: {}", userEmail);
                    sendUnauthorizedResponse(response, "Ogiltig token");
                }
            }
        } catch (Exception e) {
            log.error("Fel vid bearbetning av JWT-token: {}", e.getMessage());
            sendUnauthorizedResponse(response, "Autentiseringsfel");
        }
    }
    
    /**
     * Skickar en 401 Unauthorized-respons med meddelande
     */
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
    
    private Collection<SimpleGrantedAuthority> extractAuthorities(String token) {
        try {
            Claims claims = jwtService.extractAllClaims(token);
            Object roleObj = claims.get("role");
            
            if (roleObj != null) {
                String role = roleObj.toString();
                
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
            log.warn("Kunde inte extrahera roller från token: {}", e.getMessage());
        }
        
        return Collections.emptyList();
    }
} 
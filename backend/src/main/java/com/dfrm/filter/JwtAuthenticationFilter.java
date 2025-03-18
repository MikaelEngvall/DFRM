package com.dfrm.filter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dfrm.service.JwtService;

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
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/") || path.startsWith("/api/security/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            
            if (jwtService.validateToken(jwt, userDetails.getUsername())) {
                Collection<SimpleGrantedAuthority> authorities = extractAuthorities(jwt);
                
                // Logga alla användarens roller för debugging
                log.info("Användarroller för {}: {}", userEmail, 
                    authorities.stream().map(Object::toString).collect(Collectors.joining(", ")));
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    authorities.isEmpty() ? userDetails.getAuthorities() : authorities
                );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
    
    // Hjälpmetod för att extrahera behörigheter från token
    private Collection<SimpleGrantedAuthority> extractAuthorities(String token) {
        try {
            Claims claims = jwtService.extractAllClaims(token);
            Object roleObj = claims.get("role");
            
            if (roleObj != null) {
                String role = roleObj.toString();
                log.info("Extraherade roll från token: " + role);
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                if (role.startsWith("ROLE_")) {
                    authorities.add(new SimpleGrantedAuthority(role));
                } else {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                }
                return authorities;
            } else {
                log.warn("Ingen roll hittades i token");
            }
        } catch (Exception e) {
            log.error("Kunde inte extrahera roller från token", e);
        }
        
        log.warn("Returnerar tom rollsamling");
        return Collections.emptyList();
    }
} 
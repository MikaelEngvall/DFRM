package com.dfrm.filter;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dfrm.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import java.util.Collection;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if (request.getServletPath().contains("/auth/login")) {
            filterChain.doFilter(request, response);
            return;
        }

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
            
            if (jwtService.validateToken(jwt, userEmail)) {
                Collection<SimpleGrantedAuthority> authorities = extractAuthorities(jwt);
                
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
                logger.info("Extraherade roll från token: " + role);
                return Collections.singletonList(new SimpleGrantedAuthority(role));
            } else {
                logger.warn("Ingen roll hittades i token");
            }
        } catch (Exception e) {
            logger.error("Kunde inte extrahera roller från token", e);
        }
        
        logger.warn("Returnerar tom rollsamling");
        return Collections.emptyList();
    }
} 
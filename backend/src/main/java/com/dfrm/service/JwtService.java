package com.dfrm.service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.dfrm.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        
        // Formatera rollen korrekt för att säkerställa att den alltid har prefix
        String userRole = user.getRole();
        String roleWithPrefix = userRole != null && !userRole.isEmpty() 
            ? (userRole.startsWith("ROLE_") ? userRole : "ROLE_" + userRole)
            : "ROLE_USER"; // Defaultvärde om role är null eller tom
            
        claims.put("role", roleWithPrefix);
        
        // Förbättrad loggning
        System.out.println("Genererar token för användare: " + user.getEmail());
        System.out.println("Original roll: " + user.getRole());
        System.out.println("Formaterad roll i token: " + roleWithPrefix);
        
        // Lägg även till originalet för bakåtkompatibilitet
        claims.put("originalRole", user.getRole());
        claims.put("userId", user.getId());
        
        return createToken(claims, user.getEmail());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (Exception e) {
            log.error("Fel vid extrahering av användarnamn från token: {}", e.getMessage());
            return null;
        }
    }

    public Date extractExpiration(String token) {
        try {
            return extractClaim(token, Claims::getExpiration);
        } catch (Exception e) {
            log.error("Fel vid extrahering av utgångsdatum från token: {}", e.getMessage());
            return null;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            final Claims claims = extractAllClaims(token);
            return claimsResolver.apply(claims);
        } catch (Exception e) {
            log.error("Fel vid extrahering av anspråk från token: {}", e.getMessage());
            throw e;
        }
    }

    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (io.jsonwebtoken.security.SignatureException e) {
            log.error("Ogiltig JWT-signatur: {}", e.getMessage());
            throw new SecurityException("Ogiltig tokensignatur", e);
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.error("JWT-token har gått ut: {}", e.getMessage());
            throw new SecurityException("Token har gått ut", e);
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            log.error("Felaktigt formaterad JWT-token: {}", e.getMessage());
            throw new SecurityException("Felaktig token", e);
        } catch (Exception e) {
            log.error("Fel vid validering av JWT-token: {}", e.getMessage());
            throw new SecurityException("Ogiltig token", e);
        }
    }

    public Boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration != null && expiration.before(new Date());
        } catch (Exception e) {
            log.error("Fel vid kontroll av tokenutgång: {}", e.getMessage());
            return true; // Anta att token är utgången om vi inte kan verifiera
        }
    }

    public Boolean validateToken(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            return (extractedUsername != null && extractedUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            log.error("Fel vid validering av token: {}", e.getMessage());
            return false;
        }
    }
} 
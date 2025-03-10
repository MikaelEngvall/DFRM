package com.dfrm.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.dfrm.filter.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(UserDetailsService userDetailsService, JwtAuthenticationFilter jwtAuthFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Publika endpoints (ingen autentisering krävs)
                        .requestMatchers("/api/auth/**", "/api-docs/**", "/swagger-ui/**").permitAll()
                        
                        // Lösenordsåterställning och e-postbekräftelse - ingen autentisering krävs
                        .requestMatchers("/api/security/request-password-reset", "/api/security/reset-password", "/api/security/confirm-email").permitAll()
                        
                        // För testning - tillåt alla att se approved uppgifter
                        .requestMatchers("/api/pending-tasks/approved").permitAll()
                        
                        // Specifika endpoints för alla autentiserade användare
                        .requestMatchers("/api/pending-tasks/for-review").authenticated()
                        
                        // Ge alla inloggade användare tillgång till basics GET endpoints
                        .requestMatchers(HttpMethod.GET, "/api/**").authenticated()
                        
                        // E-postbyte för autentiserade användare
                        .requestMatchers("/api/security/request-email-change").authenticated()
                        
                        // Specifika PATCH-endpoints som alla autentiserade användare kan använda
                        .requestMatchers(HttpMethod.PATCH, "/api/tasks/*/status", "/api/tasks/*/recurring").authenticated()
                        
                        // Skrivoperationer - endast ADMIN och SUPERADMIN
                        .requestMatchers(HttpMethod.POST, "/api/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN", "ROLE_USER")
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                        
                        // Övriga endpoints - kräver autentisering
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider::authenticate;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 
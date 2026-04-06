package com.javaguides.auth_service.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // On injecte le filtre JWT
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Désactiver CSRF (inutile pour une API REST stateless)
                .csrf(csrf -> csrf.disable())
                // Architecture 100% stateless grâce au JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Les endpoints de login / reset-password sont publics
                        .requestMatchers("/api/auth/**").permitAll()
                        // Tout le reste nécessite un token JWT valide
                        .requestMatchers("/api/users/**").authenticated()
                        .requestMatchers("/api/stats/**").authenticated()
                        .anyRequest().permitAll())
                // Placer le filtre JWT AVANT le filtre d'authentification standard de Spring
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    // Note : le bean PasswordEncoder est défini dans PasswordEncoderConfig.java
}

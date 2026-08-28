package com.smartfleet.smartfleet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/vehicles").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers("/api/drivers").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers("POST", "/api/missions").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers("GET", "/api/missions").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers("/api/missions/me").hasRole("CONDUCTEUR")
                .requestMatchers("/api/missions/*/start").hasRole("CONDUCTEUR")
                .requestMatchers("/api/missions/*/return").hasRole("CONDUCTEUR")
                .requestMatchers("/api/missions/*/validate").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers("/api/missions/*/maintenance").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers("/api/missions/*/fuel").hasRole("CONDUCTEUR")
                .anyRequest().authenticated()
            )
            .httpBasic(basic -> {});

        return http.build();
    }
}

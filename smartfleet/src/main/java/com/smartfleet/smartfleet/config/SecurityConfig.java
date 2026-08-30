package com.smartfleet.smartfleet.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.smartfleet.smartfleet.security.TokenAuthFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    private final TokenAuthFilter tokenAuthFilter;

    public SecurityConfig(TokenAuthFilter tokenAuthFilter) {
        this.tokenAuthFilter = tokenAuthFilter;
    }

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/vehicles").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers(HttpMethod.POST, "/api/vehicles").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers(HttpMethod.GET, "/api/drivers").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers(HttpMethod.POST, "/api/drivers").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers(HttpMethod.POST, "/api/missions").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers(HttpMethod.GET, "/api/missions").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers(HttpMethod.GET, "/api/missions/me").hasRole("CONDUCTEUR")
                .requestMatchers(HttpMethod.POST, "/api/missions/*/start").hasRole("CONDUCTEUR")
                .requestMatchers(HttpMethod.POST, "/api/missions/*/return").hasRole("CONDUCTEUR")
                .requestMatchers(HttpMethod.POST, "/api/missions/*/validate").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers(HttpMethod.POST, "/api/missions/*/maintenance").hasAnyRole("ADMIN", "GESTIONNAIRE")
                .requestMatchers(HttpMethod.POST, "/api/missions/*/fuel").hasRole("CONDUCTEUR")
                .anyRequest().authenticated()
            )
            .httpBasic(basic -> {})
            .addFilterBefore(tokenAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

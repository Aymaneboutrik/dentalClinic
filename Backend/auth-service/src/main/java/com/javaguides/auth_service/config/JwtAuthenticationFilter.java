package com.javaguides.auth_service.config;

import com.javaguides.auth_service.models.Utilisateur;
import com.javaguides.auth_service.repository.UtilisateurRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filtre JWT : exécuté une seule fois par requête.
 *
 * Il lit le header "Authorization: Bearer <token>", valide le JWT grâce à
 * JwtUtils (sans toucher à la base de données), puis place l'utilisateur
 * authentifié dans le contexte de sécurité de Spring.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils; // Notre utilitaire JWT

    @Autowired
    private UtilisateurRepository utilisateurRepository; // Pour charger l'utilisateur si besoin

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // 1. Lire le header Authorization
        String authHeader = request.getHeader("Authorization");

        // 2. Vérifier que le header commence bien par "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Pas de token → on passe la main au filtre suivant (la requête sera peut-être
            // bloquée plus loin)
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraire le token (après "Bearer ")
        String token = authHeader.substring(7);

        try {
            // 4. Valider le token (signature + expiration)
            if (jwtUtils.isTokenValid(token) &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                // 5. Extraire les informations du token (aucune DB consultée ici)
                String email = jwtUtils.getEmail(token);
                String role = jwtUtils.getRole(token);

                // 6. Charger l'utilisateur (optionnel, mais utile pour accéder à l'objet user
                // dans les contrôleurs)
                Utilisateur user = utilisateurRepository.findByEmail(email).orElse(null);

                if (user != null) {
                    // 7. Créer l'objet d'authentification Spring Security avec le rôle
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // 8. Placer l'authentification dans le contexte de sécurité
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            // Token invalide ou expiré → on continue sans authentifier (Spring bloquera si
            // la route est protégée)
        }

        filterChain.doFilter(request, response);
    }
}

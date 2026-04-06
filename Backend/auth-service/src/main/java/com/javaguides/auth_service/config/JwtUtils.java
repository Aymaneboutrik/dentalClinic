package com.javaguides.auth_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

/**
 * Utilitaire JWT : génère et valide les tokens JSON Web Token.
 * Aucune base de données n'est sollicitée lors de la vérification.
 */
@Component
public class JwtUtils {

    // Clé secrète lue depuis application.properties
    @Value("${jwt.secret}")
    private String secretKey;

    // Durée de validité du token en millisecondes (ex. 86400000 = 24h)
    @Value("${jwt.expiration}")
    private long expirationMs;

    /** Construit la clé de signature à partir de la valeur Base64 en config. */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Génère un token JWT signé contenant l'email, le rôle et l'ID de
     * l'utilisateur.
     *
     * @param email  email de l'utilisateur (= "subject" du token)
     * @param role   rôle (Dentiste, Secretaire, Assistante…)
     * @param userId identifiant de l'utilisateur en base
     * @return le token JWT sous forme de String
     */
    public String generateToken(String email, String role, Integer userId) {
        return Jwts.builder()
                .subject(email) // Identifiant principal du token
                .claim("role", role) // Rôle de l'utilisateur
                .claim("userId", userId) // ID utile pour les requêtes suivantes
                .issuedAt(new Date()) // Heure de création
                .expiration(new Date(System.currentTimeMillis() + expirationMs)) // Expiration
                .signWith(getSigningKey()) // Signature HMAC-SHA256
                .compact();
    }

    /**
     * Extrait les « claims » (données embarquées) d'un token JWT après vérification
     * de la signature et de l'expiration.
     *
     * @param token le token JWT brut
     * @return les claims du token
     * @throws io.jsonwebtoken.JwtException si le token est invalide ou expiré
     */
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Retourne l'email (subject) contenu dans le token. */
    public String getEmail(String token) {
        return extractClaims(token).getSubject();
    }

    /** Retourne le rôle contenu dans le token. */
    public String getRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    /** Retourne l'ID utilisateur contenu dans le token. */
    public Integer getUserId(String token) {
        return extractClaims(token).get("userId", Integer.class);
    }

    /** Vérifie que le token n'est pas expiré. */
    public boolean isTokenValid(String token) {
        try {
            return !extractClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}

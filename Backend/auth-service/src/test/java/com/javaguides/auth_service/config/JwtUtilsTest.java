package com.javaguides.auth_service.config;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;
    private final String secret = "mysecretkeymysecretkeymysecretkeymysecretkey"; // 32+ chars for HMAC-SHA
    private final String base64Secret = java.util.Base64.getEncoder().encodeToString(secret.getBytes());
    private final long expiration = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "secretKey", base64Secret);
        ReflectionTestUtils.setField(jwtUtils, "expirationMs", expiration);
    }

    @Test
    void generateToken_Success() {
        String token = jwtUtils.generateToken("test@example.com", "Dentiste", 1);
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void extractClaims_Success() {
        String token = jwtUtils.generateToken("test@example.com", "Dentiste", 1);
        Claims claims = jwtUtils.extractClaims(token);

        assertEquals("test@example.com", claims.getSubject());
        assertEquals("Dentiste", claims.get("role"));
        assertEquals(1, claims.get("userId"));
    }

    @Test
    void getEmail_Success() {
        String token = jwtUtils.generateToken("test@example.com", "Dentiste", 1);
        assertEquals("test@example.com", jwtUtils.getEmail(token));
    }

    @Test
    void getRole_Success() {
        String token = jwtUtils.generateToken("test@example.com", "Dentiste", 1);
        assertEquals("Dentiste", jwtUtils.getRole(token));
    }

    @Test
    void getUserId_Success() {
        String token = jwtUtils.generateToken("test@example.com", "Dentiste", 1);
        assertEquals(1, jwtUtils.getUserId(token));
    }

    @Test
    void isTokenValid_ValidToken_ReturnsTrue() {
        String token = jwtUtils.generateToken("test@example.com", "Dentiste", 1);
        assertTrue(jwtUtils.isTokenValid(token));
    }

    @Test
    void isTokenValid_InvalidToken_ReturnsFalse() {
        assertFalse(jwtUtils.isTokenValid("invalid.token.here"));
    }
}

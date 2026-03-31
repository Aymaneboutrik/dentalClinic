package com.javaguides.auth_service.repository;

import com.javaguides.auth_service.AuthServiceApplication;
import com.javaguides.auth_service.models.Dentiste;
import com.javaguides.auth_service.models.PasswordResetToken;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = AuthServiceApplication.class)
@Transactional
class PasswordResetTokenRepositoryTest {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Test
    void findByToken_Success() {
        String tokenStr = "test-token-" + System.currentTimeMillis();
        
        Dentiste user = new Dentiste();
        user.setEmail("token_test_" + System.currentTimeMillis() + "@example.com");
        user.setNom("Token");
        user.setPrenom("User");
        user.setMotDePasse("pass");
        user.setDateCreation(LocalDateTime.now());
        utilisateurRepository.save(user);

        PasswordResetToken token = new PasswordResetToken(tokenStr, user, LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(token);

        Optional<PasswordResetToken> found = tokenRepository.findByToken(tokenStr);

        assertTrue(found.isPresent());
        assertEquals(user.getEmail(), found.get().getUtilisateur().getEmail());
    }

    @Test
    void deleteByUtilisateur_Success() {
        String tokenStr = "delete-token-" + System.currentTimeMillis();
        
        Dentiste user = new Dentiste();
        user.setEmail("delete_test_" + System.currentTimeMillis() + "@example.com");
        user.setNom("Delete");
        user.setPrenom("Token");
        user.setMotDePasse("pass");
        user.setDateCreation(LocalDateTime.now());
        utilisateurRepository.save(user);

        PasswordResetToken token = new PasswordResetToken(tokenStr, user, LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(token);

        tokenRepository.deleteByUtilisateur(user);
        
        Optional<PasswordResetToken> found = tokenRepository.findByToken(tokenStr);
        assertFalse(found.isPresent());
    }
}

package com.javaguides.auth_service.repository;

import com.javaguides.auth_service.models.Dentiste;
import com.javaguides.auth_service.models.Utilisateur;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = com.javaguides.auth_service.AuthServiceApplication.class)
@Transactional
class UtilisateurRepositoryTest {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Test
    void findByEmail_Success() {
        String email = "repo_" + System.currentTimeMillis() + "@example.com";
        Dentiste user = new Dentiste();
        user.setNom("Test");
        user.setPrenom("User");
        user.setEmail(email);
        user.setMotDePasse("pass");
        user.setActif(true);
        user.setDateCreation(LocalDateTime.now());
        utilisateurRepository.save(user);

        Optional<Utilisateur> found = utilisateurRepository.findByEmail(email);

        assertTrue(found.isPresent());
        assertEquals(email, found.get().getEmail());
    }

    @Test
    void countByActifTrue_Success() {
        long initialCount = utilisateurRepository.countByActifTrue();

        Dentiste user1 = new Dentiste();
        user1.setEmail("u1_" + System.currentTimeMillis() + "@example.com");
        user1.setMotDePasse("pass");
        user1.setNom("N1");
        user1.setPrenom("P1");
        user1.setActif(true);
        user1.setDateCreation(LocalDateTime.now());
        utilisateurRepository.save(user1);

        Dentiste user2 = new Dentiste();
        user2.setEmail("u2_" + System.currentTimeMillis() + "@example.com");
        user2.setMotDePasse("pass");
        user2.setNom("N2");
        user2.setPrenom("P2");
        user2.setActif(false);
        user2.setDateCreation(LocalDateTime.now());
        utilisateurRepository.save(user2);

        long count = utilisateurRepository.countByActifTrue();

        assertEquals(initialCount + 1, count, "Active user count should have increased by 1");
    }
}

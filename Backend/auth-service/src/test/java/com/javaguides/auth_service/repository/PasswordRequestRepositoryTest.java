package com.javaguides.auth_service.repository;

import com.javaguides.auth_service.AuthServiceApplication;
import com.javaguides.auth_service.models.Dentiste;
import com.javaguides.auth_service.models.PasswordRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = AuthServiceApplication.class)
@Transactional
class PasswordRequestRepositoryTest {

    @Autowired
    private PasswordRequestRepository requestRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Test
    void findByStatus_Success() {
        Dentiste user = new Dentiste();
        user.setEmail("req_test_" + System.currentTimeMillis() + "@example.com");
        user.setNom("Req");
        user.setPrenom("User");
        user.setMotDePasse("pass");
        user.setDateCreation(LocalDateTime.now());
        utilisateurRepository.save(user);

        PasswordRequest request = new PasswordRequest();
        request.setUtilisateur(user);
        request.setHashedPassword("new-pass");
        request.setType(PasswordRequest.RequestType.CHANGE);
        request.setStatus(PasswordRequest.RequestStatus.PENDING);
        requestRepository.save(request);

        List<PasswordRequest> pending = requestRepository.findByStatus(PasswordRequest.RequestStatus.PENDING);
        assertTrue(pending.stream().anyMatch(r -> r.getUtilisateur().getIdUtilisateur().equals(user.getIdUtilisateur())));
    }

    @Test
    void findByUtilisateurAndStatusAndNotified_Success() {
        Dentiste user = new Dentiste();
        user.setEmail("notif_test_" + System.currentTimeMillis() + "@example.com");
        user.setNom("Notif");
        user.setPrenom("User");
        user.setMotDePasse("pass");
        user.setDateCreation(LocalDateTime.now());
        utilisateurRepository.save(user);

        PasswordRequest request = new PasswordRequest();
        request.setUtilisateur(user);
        request.setHashedPassword("new-pass");
        request.setType(PasswordRequest.RequestType.CHANGE);
        request.setStatus(PasswordRequest.RequestStatus.APPROVED);
        request.setNotified(false);
        requestRepository.save(request);

        List<PasswordRequest> results = requestRepository.findByUtilisateurAndStatusAndNotified(
                user, PasswordRequest.RequestStatus.APPROVED, false);

        assertEquals(1, results.size());
        assertEquals(user.getIdUtilisateur(), results.get(0).getUtilisateur().getIdUtilisateur());
    }
}

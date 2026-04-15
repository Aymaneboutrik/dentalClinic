package com.javaguides.auth_service.services;

import com.javaguides.auth_service.config.JwtUtils;
import com.javaguides.auth_service.dtos.LoginRequest;
import com.javaguides.auth_service.dtos.RegisterRequest;
import com.javaguides.auth_service.models.*;
import com.javaguides.auth_service.repository.PasswordRequestRepository;
import com.javaguides.auth_service.repository.PasswordResetTokenRepository;
import com.javaguides.auth_service.repository.UtilisateurRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PasswordRequestRepository passwordRequestRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setNom("Test");
        registerRequest.setPrenom("User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setRole("assistante");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void register_Success() {
        when(utilisateurRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        
        Assistante mockUser = new Assistante();
        mockUser.setEmail(registerRequest.getEmail());
        when(utilisateurRepository.save(any(Utilisateur.class))).thenReturn(mockUser);

        Utilisateur result = authService.register(registerRequest);

        assertNotNull(result);
        assertEquals(registerRequest.getEmail(), result.getEmail());
        verify(utilisateurRepository, times(1)).save(any(Utilisateur.class));
    }

    @Test
    void register_EmailAlreadyExists_ThrowsException() {
        when(utilisateurRepository.findByEmail(anyString())).thenReturn(Optional.of(new Assistante()));

        Exception exception = assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
        assertEquals("Email déjà utilisé", exception.getMessage());
    }

    @Test
    void login_Success() {
        Dentiste user = new Dentiste();
        user.setIdUtilisateur(1);
        user.setEmail("test@example.com");
        user.setMotDePasse("hashed_password");
        user.setActif(true);

        when(utilisateurRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getMotDePasse())).thenReturn(true);
        when(jwtUtils.generateToken(anyString(), anyString(), anyInt())).thenReturn("mock_token");
        when(passwordRequestRepository.findByUtilisateurAndStatusAndNotified(any(), any(), anyBoolean())).thenReturn(Collections.emptyList());

        Map<String, Object> response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock_token", response.get("token"));
        assertEquals("Dentiste", response.get("role"));
        verify(utilisateurRepository, times(1)).save(user);
    }

    @Test
    void login_AccountDisabled_ThrowsException() {
        Dentiste user = new Dentiste();
        user.setEmail("test@example.com");
        user.setMotDePasse("hashed_password");
        user.setActif(false);

        when(utilisateurRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getMotDePasse())).thenReturn(true);

        Exception exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertEquals("Compte désactivé par l'administrateur", exception.getMessage());
    }

    @Test
    void login_WithPendingApprovedRequest_NotifiesUser() {
        Dentiste user = new Dentiste();
        user.setIdUtilisateur(1);
        user.setEmail("test@example.com");
        user.setMotDePasse("hashed_password");
        user.setActif(true);

        PasswordRequest approvedRequest = new PasswordRequest();
        approvedRequest.setStatus(PasswordRequest.RequestStatus.APPROVED);

        when(utilisateurRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getMotDePasse())).thenReturn(true);
        when(passwordRequestRepository.findByUtilisateurAndStatusAndNotified(eq(user), eq(PasswordRequest.RequestStatus.APPROVED), eq(false)))
                .thenReturn(java.util.List.of(approvedRequest));
        when(jwtUtils.generateToken(anyString(), anyString(), anyInt())).thenReturn("mock_token");

        Map<String, Object> response = authService.login(loginRequest);

        assertEquals("Votre demande de changement de mot de passe a été approuvée.", response.get("notification"));
        verify(passwordRequestRepository, times(1)).save(approvedRequest);
        assertTrue(approvedRequest.getNotified());
    }

    @Test
    void login_WithPendingRejectedRequest_NotifiesUser() {
        Dentiste user = new Dentiste();
        user.setIdUtilisateur(1);
        user.setEmail("test@example.com");
        user.setMotDePasse("hashed_password");
        user.setActif(true);

        PasswordRequest rejectedRequest = new PasswordRequest();
        rejectedRequest.setStatus(PasswordRequest.RequestStatus.REJECTED);

        when(utilisateurRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getMotDePasse())).thenReturn(true);
        when(passwordRequestRepository.findByUtilisateurAndStatusAndNotified(eq(user), eq(PasswordRequest.RequestStatus.APPROVED), eq(false)))
                .thenReturn(Collections.emptyList());
        when(passwordRequestRepository.findByUtilisateurAndStatusAndNotified(eq(user), eq(PasswordRequest.RequestStatus.REJECTED), eq(false)))
                .thenReturn(java.util.List.of(rejectedRequest));
        when(jwtUtils.generateToken(anyString(), anyString(), anyInt())).thenReturn("mock_token");

        Map<String, Object> response = authService.login(loginRequest);

        assertEquals("Votre demande de changement de mot de passe a été rejetée par le dentiste.", response.get("notification"));
        verify(passwordRequestRepository, times(1)).save(rejectedRequest);
        assertTrue(rejectedRequest.getNotified());
    }

    @Test
    void login_WrongPassword_ApprovedRequestExists_SmartNotification() {
        Dentiste user = new Dentiste();
        user.setEmail("test@example.com");
        user.setMotDePasse("hashed_password");

        PasswordRequest approvedRequest = new PasswordRequest();

        when(utilisateurRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getMotDePasse())).thenReturn(false);
        when(passwordRequestRepository.findByUtilisateurAndStatusAndNotified(eq(user), eq(PasswordRequest.RequestStatus.APPROVED), eq(false)))
                .thenReturn(java.util.List.of(approvedRequest));

        Exception exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertTrue(exception.getMessage().contains("été approuvée ! Merci d'utiliser votre nouveau mot de passe"));
    }

    @Test
    void login_WrongPassword_IncrementsAttempts() {
        Dentiste user = new Dentiste();
        user.setEmail("test@example.com");
        user.setMotDePasse("hashed_password");
        user.setTentativesConnexion(0);

        when(utilisateurRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getMotDePasse())).thenReturn(false);
        when(passwordRequestRepository.findByUtilisateurAndStatusAndNotified(any(), any(), anyBoolean())).thenReturn(Collections.emptyList());

        Exception exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertEquals("Mot de passe incorrect", exception.getMessage());
        assertEquals(1, user.getTentativesConnexion());
        verify(utilisateurRepository, times(1)).save(user);
    }

    @Test
    void login_AccountLockedAfter5Attempts() {
        Dentiste user = new Dentiste();
        user.setEmail("test@example.com");
        user.setMotDePasse("hashed_password");
        user.setTentativesConnexion(4);

        when(utilisateurRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getMotDePasse())).thenReturn(false);
        when(passwordRequestRepository.findByUtilisateurAndStatusAndNotified(any(), any(), anyBoolean())).thenReturn(Collections.emptyList());

        Exception exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertTrue(exception.getMessage().contains("Compte verrouillé"));
        assertNotNull(user.getDateVerrouillage());
        verify(utilisateurRepository, times(1)).save(user);
    }

    @Test
    void changePassword_DentistSuccess() {
        Dentiste dentist = new Dentiste();
        dentist.setIdUtilisateur(1);
        dentist.setMotDePasse("old_hashed");

        when(utilisateurRepository.findById(1)).thenReturn(Optional.of(dentist));
        when(passwordEncoder.matches("old_pass", "old_hashed")).thenReturn(true);
        when(passwordEncoder.encode("new_pass")).thenReturn("new_hashed");

        authService.changePassword(1, "old_pass", "new_pass");

        assertEquals("new_hashed", dentist.getMotDePasse());
        verify(utilisateurRepository, times(1)).save(dentist);
    }

    @Test
    void changePassword_AssistantCreatesRequest() {
        Assistante assistant = new Assistante();
        assistant.setIdUtilisateur(2);
        assistant.setMotDePasse("old_hashed");

        when(utilisateurRepository.findById(2)).thenReturn(Optional.of(assistant));
        when(passwordEncoder.matches("old_pass", "old_hashed")).thenReturn(true);
        when(passwordEncoder.encode("new_pass")).thenReturn("new_hashed");

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> authService.changePassword(2, "old_pass", "new_pass"));
        
        assertTrue(exception.getMessage().contains("demande de changement de mot de passe a été envoyée"));
        verify(passwordRequestRepository, times(1)).save(any(PasswordRequest.class));
    }

    @Test
    void changePassword_WrongOldPassword_ThrowsException() {
        Utilisateur user = new Dentiste();
        user.setMotDePasse("correct_hashed");

        when(utilisateurRepository.findById(1)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong_pass", "correct_hashed")).thenReturn(false);
        when(passwordRequestRepository.findByUtilisateurAndStatusAndNotified(any(), any(), anyBoolean())).thenReturn(Collections.emptyList());

        Exception exception = assertThrows(RuntimeException.class, () -> authService.changePassword(1, "wrong_pass", "new_pass"));
        assertEquals("Ancien mot de passe incorrect", exception.getMessage());
    }

    @Test
    void requestPasswordReset_DentistSuccess() {
        Dentiste dentist = new Dentiste();
        dentist.setEmail("dentist@example.com");

        when(utilisateurRepository.findByEmail("dentist@example.com")).thenReturn(Optional.of(dentist));

        authService.requestPasswordReset("dentist@example.com");

        verify(passwordResetTokenRepository, times(1)).save(any(PasswordResetToken.class));
        verify(emailService, times(1)).sendPasswordResetEmail(eq("dentist@example.com"), anyString());
    }

    @Test
    void requestPasswordReset_AssistantFails() {
        Assistante assistant = new Assistante();
        assistant.setEmail("assistant@example.com");

        when(utilisateurRepository.findByEmail("assistant@example.com")).thenReturn(Optional.of(assistant));

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> authService.requestPasswordReset("assistant@example.com"));
        
        assertTrue(exception.getMessage().contains("Seul le Dentiste"));
    }

    @Test
    void resetPasswordWithToken_Success() {
        PasswordResetToken token = new PasswordResetToken();
        Utilisateur user = new Dentiste();
        token.setUtilisateur(user);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        token.setToken("valid-token");

        when(passwordResetTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("new_pass")).thenReturn("new_hashed");

        authService.resetPasswordWithToken("valid-token", "new_pass");

        assertEquals("new_hashed", user.getMotDePasse());
        verify(passwordResetTokenRepository, times(1)).delete(token);
    }

    @Test
    void resetPasswordWithToken_Expired() {
        PasswordResetToken token = new PasswordResetToken();
        token.setExpiryDate(LocalDateTime.now().minusMinutes(1)); // Expired
        token.setToken("expired-token");

        when(passwordResetTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(token));

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> authService.resetPasswordWithToken("expired-token", "new_pass"));
        
        assertTrue(exception.getMessage().contains("expiré"));
        verify(passwordResetTokenRepository, times(1)).delete(token);
    }

    @Test
    void approvePasswordRequest_Success() {
        PasswordRequest request = new PasswordRequest();
        Utilisateur user = new Assistante();
        request.setUtilisateur(user);
        request.setHashedPassword("new_hashed");

        when(passwordRequestRepository.findById(1)).thenReturn(Optional.of(request));

        authService.approvePasswordRequest(1);

        assertEquals("new_hashed", user.getMotDePasse());
        assertEquals(PasswordRequest.RequestStatus.APPROVED, request.getStatus());
        verify(utilisateurRepository, times(1)).save(user);
        verify(passwordRequestRepository, times(1)).save(request);
    }

    @Test
    void rejectPasswordRequest_Success() {
        PasswordRequest request = new PasswordRequest();
        when(passwordRequestRepository.findById(1)).thenReturn(Optional.of(request));

        authService.rejectPasswordRequest(1);

        assertEquals(PasswordRequest.RequestStatus.REJECTED, request.getStatus());
        verify(passwordRequestRepository, times(1)).save(request);
    }

    @Test
    void updateUserStatus_Success() {
        Utilisateur user = new Assistante();
        when(utilisateurRepository.findById(1)).thenReturn(Optional.of(user));

        authService.updateUserStatus(1, false);

        assertFalse(user.getActif());
        verify(utilisateurRepository, times(1)).save(user);
    }

    @Test
    void getAllUsers_Success() {
        when(utilisateurRepository.findAll()).thenReturn(Collections.singletonList(new Dentiste()));
        
        java.util.List<Utilisateur> users = authService.getAllUsers();
        
        assertEquals(1, users.size());
        verify(utilisateurRepository, times(1)).findAll();
    }

    @Test
    void getUserById_Success() {
        Utilisateur user = new Dentiste();
        when(utilisateurRepository.findById(1)).thenReturn(Optional.of(user));

        Utilisateur result = authService.getUserById(1);

        assertEquals(user, result);
    }

    @Test
    void updateUser_BasicInfo_Success() {
        Utilisateur user = new Assistante();
        user.setNom("OldNom");
        user.setEmail("old@example.com");

        when(utilisateurRepository.findById(1)).thenReturn(Optional.of(user));

        Map<String, String> updates = Map.of(
            "nom", "NewNom",
            "email", "new@example.com"
        );

        authService.updateUser(1, updates);

        assertEquals("NewNom", user.getNom());
        assertEquals("new@example.com", user.getEmail());
        verify(utilisateurRepository, times(1)).save(user);
    }
}

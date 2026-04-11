package com.javaguides.auth_service.controller;

import com.javaguides.auth_service.dtos.LoginRequest;
import com.javaguides.auth_service.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import jakarta.validation.Valid;

@RestController // Indique que cette classe est un contrôleur REST pur. Spring convertit
                // automatiquement les réponses en JSON (fini les vues HTML/Thymeleaf)
@RequestMapping("/api/auth") // Définit le préfixe de l'URL pour tous les endpoints de ce contrôleur
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login") // Définit un point d'accès HTTP POST pour la connexion
    // @RequestBody force Spring à lire le JSON envoyé par le client, contrairement
    // aux anciens paramètres de formulaire (form-data)
    // ResponseEntity<?> permet de renvoyer une réponse HTTP standard (statut,
    // headers, corps en JSON)
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        java.util.Map<String, Object> response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String result = authService.requestPasswordReset(request.get("email"));
        
        if ("DENTIST_EMAIL_SENT".equals(result)) {
            return ResponseEntity.ok(Map.of("message",
                "Un lien de réinitialisation vous a été envoyé par e-mail. Veuillez vérifier votre boîte de réception."));
        } else {
            return ResponseEntity.ok(Map.of("message",
                "Cette fonctionnalité est réservée au Dentiste. Veuillez le contacter en personne pour réinitialiser votre accès."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        authService.resetPasswordWithToken(request.get("token"), request.get("newPassword"));
        return ResponseEntity.ok(Map.of("message",
                "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter."));
    }
}

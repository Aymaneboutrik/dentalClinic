package com.javaguides.auth_service.controller;

import com.javaguides.auth_service.dtos.ChangePasswordRequest;
import com.javaguides.auth_service.dtos.RegisterRequest;
import com.javaguides.auth_service.models.Dentiste;
import com.javaguides.auth_service.models.PasswordRequest;
import com.javaguides.auth_service.models.Utilisateur;
import com.javaguides.auth_service.services.AuthService;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.stream.Collectors;

@RestController // Renvoie tous les résultats sous forme de JSON, plus de pages HTML générées
                // par le serveur (Thymeleaf, etc.)
@RequestMapping("/api/users") // Préfixe d'accès standardisé pour les ressources utilisateur dans une API REST
public class UserController {

    @Autowired
    private AuthService authService;

    // Helper to get currently authenticated user
    private Utilisateur getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Utilisateur)) {
            throw new RuntimeException("Non authentifié");
        }
        return (Utilisateur) auth.getPrincipal();
    }

    private void checkDentistRole() {
        Utilisateur user = getCurrentUser();
        if (!Hibernate.getClass(user).equals(Dentiste.class)) {
            throw new RuntimeException("Accès refusé : Réservé aux dentistes");
        }
    }

    @GetMapping // Endpoint REST en GET pour récupérer des données (respecte les conventions
                // HTTP)
    public ResponseEntity<?> getAllUsers() {
        checkDentistRole();
        java.util.List<Utilisateur> users = authService.getAllUsers();
        java.util.List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Utilisateur u : users) {
            Map<String, Object> userMap = new java.util.LinkedHashMap<>();
            userMap.put("idUtilisateur", u.getIdUtilisateur());
            userMap.put("nom", u.getNom());
            userMap.put("prenom", u.getPrenom());
            userMap.put("email", u.getEmail());
            userMap.put("role", Hibernate.getClass(u).getSimpleName());
            userMap.put("actif", u.getActif());
            result.add(userMap);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/status") // Utilisation de données paramétrables dans l'URL ({id})
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> status) {
        checkDentistRole();
        authService.updateUserStatus(id, status.get("active"));
        return ResponseEntity.ok(Map.of("message", "Statut mis à jour"));
    }

    // Change password (for oneself)
    @PostMapping("/password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        Utilisateur user = getCurrentUser();
        authService.changePassword(user.getIdUtilisateur(), request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié"));
    }

    @GetMapping("/password-requests")
    public ResponseEntity<?> getPendingRequests() {
        checkDentistRole();
        java.util.List<PasswordRequest> requests = authService.getPendingPasswordRequests();
        java.util.List<Map<String, Object>> result = requests.stream().map(r -> {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", r.getId());
            map.put("nom", r.getUtilisateur().getNom());
            map.put("prenom", r.getUtilisateur().getPrenom());
            map.put("email", r.getUtilisateur().getEmail());
            map.put("type", r.getType());
            map.put("createdAt", r.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/password-requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Integer id) {
        checkDentistRole();
        authService.approvePasswordRequest(id);
        return ResponseEntity.ok(Map.of("message", "Demande approuvée"));
    }

    @PostMapping("/password-requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Integer id) {
        checkDentistRole();
        authService.rejectPasswordRequest(id);
        return ResponseEntity.ok(Map.of("message", "Demande rejetée"));
    }

    // Profile info
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Utilisateur user = getCurrentUser();
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<?> createUser(
            @Valid @RequestBody RegisterRequest request) {
        checkDentistRole();
        Utilisateur user = authService.register(request);
        return ResponseEntity.ok(Map.of("message", "Utilisateur créé avec succès", "id", user.getIdUtilisateur()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Integer id,
            @RequestBody Map<String, String> updates) {
        checkDentistRole();
        authService.updateUser(id, updates);
        return ResponseEntity.ok(Map.of("message", "Utilisateur modifié avec succès"));
    }
}

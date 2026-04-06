package com.javaguides.auth_service.repository; // Emplacement du fichier

import com.javaguides.auth_service.models.PasswordRequest; // Importation du modèle des demandes de mot de passe
import org.springframework.data.jpa.repository.JpaRepository; // Outil de gestion SQL automatique
import org.springframework.stereotype.Repository; // Annotation pour l'accès aux données

import java.util.List; // Importation pour gérer des listes d'objets

@Repository // Indique que c'est un composant d'accès aux données
public interface PasswordRequestRepository extends JpaRepository<PasswordRequest, Integer> {

    List<PasswordRequest> findByStatus(PasswordRequest.RequestStatus status);
    // Trouve toutes les demandes avec un statut précis (ex: toutes les demandes EN
    // ATTENTE pour le dentiste)

    List<PasswordRequest> findByUtilisateurAndStatusAndNotified(
            com.javaguides.auth_service.models.Utilisateur utilisateur, PasswordRequest.RequestStatus status,
            Boolean notified);
    // Fonction plus complexe : Trouve les demandes pour un utilisateur précis, avec
    // un statut précis,
    // et vérifie si l'utilisateur a déjà été notifié du résultat.
}
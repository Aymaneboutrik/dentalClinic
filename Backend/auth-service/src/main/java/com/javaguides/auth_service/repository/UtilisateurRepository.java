package com.javaguides.auth_service.repository; // Définition de l'emplacement du fichier (package)

import com.javaguides.auth_service.models.Utilisateur; // Importation du modèle Utilisateur que nous avons créé avant
import org.springframework.data.jpa.repository.JpaRepository; // Importation de l'outil Spring qui gère automatiquement SQL
import org.springframework.stereotype.Repository; // Annotation qui dit à Spring que ce fichier gère l'accès aux données

@Repository // Indique que c'est un composant de stockage (Repository)
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
    // "extends JpaRepository" : On hérite de toutes les fonctions de base (save,
    // findById, delete, etc.)
    // Utilisateur : le type d'objet à gérer
    // Integer : le type de la clé primaire (ID)

    java.util.Optional<Utilisateur> findByEmail(String email);
    // Fonction personnalisée : Spring va générer automatiquement la requête SQL
    // "SELECT * FROM utilisateur WHERE email = ?"
    // Optional : permet d'éviter les erreurs si aucun utilisateur n'est trouvé avec
    // cet email

    long countByActifTrue();
    // Fonction personnalisée : Spring va générer un "SELECT COUNT(*) FROM
    // utilisateur WHERE actif = true"
    // Utile pour les statistiques du projet
}

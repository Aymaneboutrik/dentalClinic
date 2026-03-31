package com.javaguides.auth_service.services; // Emplacement du fichier

import com.javaguides.auth_service.config.JwtUtils; // Notre utilitaire JWT
import com.javaguides.auth_service.dtos.LoginRequest; // DTO pour les données de connexion
import com.javaguides.auth_service.dtos.RegisterRequest; // DTO pour les données d'inscription
import com.javaguides.auth_service.models.*; // Importation de tous les modèles (Utilisateur, etc.)
import com.javaguides.auth_service.repository.UtilisateurRepository; // Repository pour les utilisateurs
import com.javaguides.auth_service.repository.PasswordRequestRepository; // Repository pour les demandes de mots de passe
import com.javaguides.auth_service.repository.PasswordResetTokenRepository; // Repository pour les jetons de réinitialisation
import org.hibernate.Hibernate; // Outil pour gérer les types d'objets (Lazy loading)
import org.springframework.beans.factory.annotation.Autowired; // Pour l'injection automatique des dépendances
import org.springframework.security.crypto.password.PasswordEncoder; // Pour vérifier les mots de passe hachés
import org.springframework.stereotype.Service; // Annotation pour dire que c'est un composant "Métier" (Logique)

import java.time.LocalDateTime; // Pour gérer les dates

@Service // Indique que cette classe contient la logique métier de l'application
public class AuthService {

    @Autowired // Injection automatique du repository Utilisateur
    private UtilisateurRepository utilisateurRepository;

    @Autowired // Injection de l'utilitaire JWT pour générrer les tokens
    private JwtUtils jwtUtils;

    @Autowired // Injection automatique de l'encodeur de mot de passe
    private PasswordEncoder passwordEncoder;

    @Autowired // Injection automatique du repository des demandes de mot de passe
    private PasswordRequestRepository passwordRequestRepository;

    @Autowired // Injection automatique du repository des jetons de réinitialisation
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired // Injection du service d'email
    private EmailService emailService;

    @org.springframework.transaction.annotation.Transactional // Assure que toutes les opérations SQL réussissent
                                                              // ensemble ou échouent ensemble
    public java.util.Map<String, Object> login(LoginRequest request) { // Fonction pour se connecter
        // 1. Chercher l'utilisateur par son email
        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 2. Vérifier si le compte est verrouillé (pour 15 minutes)
        if (user.getDateVerrouillage() != null) {
            if (user.getDateVerrouillage().isAfter(LocalDateTime.now().minusMinutes(15))) {
                throw new RuntimeException("Compte verrouillé. Réessayez dans quelques minutes.");
            } else {
                // Le délai est passé, on réinitialise
                user.setDateVerrouillage(null);
                user.setTentativesConnexion(0);
                utilisateurRepository.save(user);
            }
        }

        // 3. Vérifier si le mot de passe correspond au mot de passe haché en base
        if (!passwordEncoder.matches(request.getPassword(), user.getMotDePasse())) {
            // Check if there is a recently approved password request that hasn't been notified yet
            java.util.List<PasswordRequest> approvedRequests = passwordRequestRepository
                    .findByUtilisateurAndStatusAndNotified(user, PasswordRequest.RequestStatus.APPROVED, false);

            if (!approvedRequests.isEmpty()) {
                throw new RuntimeException("Votre demande de changement de mot de passe a été approuvée ! " +
                        "Merci d'utiliser votre nouveau mot de passe dès maintenant.");
            }

            user.setTentativesConnexion(user.getTentativesConnexion() + 1);
            if (user.getTentativesConnexion() >= 5) {
                user.setDateVerrouillage(LocalDateTime.now());
                utilisateurRepository.save(user);
                throw new RuntimeException("Compte verrouillé après 5 tentatives infructueuses.");
            }
            utilisateurRepository.save(user);
            throw new RuntimeException("Mot de passe incorrect");
        }

        // 4. Réinitialiser les tentatives si réussite
        user.setTentativesConnexion(0);
        user.setDateVerrouillage(null);
        utilisateurRepository.save(user);

        // 5. Vérifier si le compte n'est pas suspendu (actif = false mis par le
        // dentiste)
        if (!user.getActif()) {
            throw new RuntimeException("Compte désactivé par l'administrateur");
        }

        // 4. Vérifier s'il y a des changements de mot de passe acceptés ou refusés par le dentiste
        String notification = null;
        
        // Vérifier les demandes APPROUVÉES
        java.util.List<PasswordRequest> approvedRequests = passwordRequestRepository
                .findByUtilisateurAndStatusAndNotified(user, PasswordRequest.RequestStatus.APPROVED, false);

        if (!approvedRequests.isEmpty()) {
            notification = "Votre demande de changement de mot de passe a été approuvée.";
            for (PasswordRequest pr : approvedRequests) {
                pr.setNotified(true);
                passwordRequestRepository.save(pr);
            }
        } else {
            // Sinon, vérifier les demandes REJETÉES ("l'inverse aussi")
            java.util.List<PasswordRequest> rejectedRequests = passwordRequestRepository
                    .findByUtilisateurAndStatusAndNotified(user, PasswordRequest.RequestStatus.REJECTED, false);

            if (!rejectedRequests.isEmpty()) {
                notification = "Votre demande de changement de mot de passe a été rejetée par le dentiste.";
                for (PasswordRequest pr : rejectedRequests) {
                    pr.setNotified(true);
                    passwordRequestRepository.save(pr);
                }
            }
        }

        // 5. Générer le token JWT (remplace la création de session en base de données)
        String role = Hibernate.getClass(user).getSimpleName(); // "Dentiste", "Secretaire", "Assistante"…
        String token = jwtUtils.generateToken(user.getEmail(), role, user.getIdUtilisateur());

        // 6. Préparer la réponse JSON pour le Front-end
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", token); // JWT à stocker côté client (localStorage / cookie)
        response.put("role", role); // Rôle (Dentiste, etc.)
        response.put("nom", user.getNom());
        response.put("prenom", user.getPrenom());
        if (notification != null) {
            response.put("notification", notification);
        }
        return response; // Retourner les infos au contrôleur
    }

    public Utilisateur register(RegisterRequest request) { // Fonction pour inscrire un nouvel utilisateur
        // 1. Vérifier si l'email n'est pas déjà pris
        if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        Utilisateur newUser; // Création de la variable pour le futur utilisateur
        String role = request.getRole() != null ? request.getRole() : "Utilisateur"; // Récupérer le rôle ou mettre
                                                                                     // "Utilisateur" par défaut

        // 2. Création de l'objet concret selon le rôle choisi (Logique de "Factory")
        switch (role.toLowerCase()) {
            case "dentiste":
                newUser = new Dentiste();
                break;
            case "assistante":
                newUser = new Assistante();
                break;
            case "secretaire":
                newUser = new Secretaire();
                break;
            default:
                newUser = new Secretaire(); // Par défaut, on crée une secrétaire si le rôle est inconnu
                break;
        }

        // 3. Remplir les informations de l'utilisateur
        newUser.setNom(request.getNom());
        newUser.setPrenom(request.getPrenom());
        newUser.setEmail(request.getEmail());
        newUser.setMotDePasse(passwordEncoder.encode(request.getPassword())); // HASHER le mot de passe pour qu'il soit
                                                                              // illisible en base
        newUser.setActif(true); // Compte actif par défaut
        newUser.setDateCreation(LocalDateTime.now()); // Date d'inscription

        // 4. Sauvegarder dans la base de données via le Repository
        return utilisateurRepository.save(newUser);
    }

    public void changePassword(Integer userId, String oldPassword, String newPassword) { // Fonction pour changer de mot
                                                                                         // de passe
        // 1. Trouver l'utilisateur dans la base
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 2. Vérifier si l'ancien mot de passe saisi est correct
        if (!passwordEncoder.matches(oldPassword, user.getMotDePasse())) {
            // Check if there is a recently approved password request that hasn't been notified yet
            java.util.List<PasswordRequest> approvedRequests = passwordRequestRepository
                    .findByUtilisateurAndStatusAndNotified(user, PasswordRequest.RequestStatus.APPROVED, false);

            if (!approvedRequests.isEmpty()) {
                throw new RuntimeException("Votre demande de changement de mot de passe a été approuvée ! " +
                        "Merci d'utiliser votre nouveau mot de passe dès maintenant.");
            }
            throw new RuntimeException("Ancien mot de passe incorrect");
        }

        String hashed = passwordEncoder.encode(newPassword); // Hacher le nouveau mot de passe

        // 3. Logique spécifique au projet (PFA) :
        if (Hibernate.getClass(user).equals(Dentiste.class)) {
            // Si c'est le Dentiste, il peut changer son mot de passe immédiatement
            user.setMotDePasse(hashed);
            utilisateurRepository.save(user);
        } else {
            // Si c'est une assistante ou secrétaire, on crée une DEMANDE (PasswordRequest)
            PasswordRequest request = new PasswordRequest();
            request.setUtilisateur(user); // Qui demande ?
            request.setHashedPassword(hashed); // Quel sera le nouveau mot de passe ?
            request.setType(PasswordRequest.RequestType.CHANGE); // C'est un changement simple
            request.setStatus(PasswordRequest.RequestStatus.PENDING); // Statut "En attente" du dentiste
            passwordRequestRepository.save(request); // Enregistrement de la demande

            // On informe l'utilisateur que ce n'est pas immédiat
            throw new RuntimeException(
                    "Votre demande de changement de mot de passe a été envoyée. Veuillez attendre la validation par le Dentiste.");
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void requestPasswordReset(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec cet email"));

        // Add check to ensure only the Dentist can reset their password
        if (!Hibernate.getClass(user).equals(Dentiste.class)) {
            throw new RuntimeException(
                    "Seul le Dentiste peut réinitialiser son mot de passe par e-mail. Veuillez contacter le Dentiste pour créer un nouveau compte.");
        }

        // Nettoyer les anciens jetons de cet utilisateur s'il y en a
        passwordResetTokenRepository.deleteByUtilisateur(user);
        passwordResetTokenRepository.flush(); // Force la suppression immédiate pour éviter le conflit de clé

        // Générer un nouveau jeton aléatoire
        String token = java.util.UUID.randomUUID().toString();

        // Créer l'entité Jeton (valide 15 minutes)
        PasswordResetToken resetToken = new PasswordResetToken(
                token,
                user,
                LocalDateTime.now().plusMinutes(15));
        passwordResetTokenRepository.save(resetToken);

        // Envoyer l'e-mail avec le lien
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @org.springframework.transaction.annotation.Transactional
    public void resetPasswordWithToken(String token, String newPassword) {
        // Chercher le jeton en base
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Lien de réinitialisation invalide ou introuvable"));

        // Vérifier si le jeton est expiré
        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("Le lien de réinitialisation a expiré (plus de 15 minutes)");
        }

        // Mettre à jour le mot de passe de l'utilisateur
        Utilisateur user = resetToken.getUtilisateur();
        user.setMotDePasse(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(user);

        // Supprimer le jeton car il a été utilisé
        passwordResetTokenRepository.delete(resetToken);
    }

    public java.util.List<PasswordRequest> getPendingPasswordRequests() {
        return passwordRequestRepository.findByStatus(PasswordRequest.RequestStatus.PENDING);
    }

    @org.springframework.transaction.annotation.Transactional
    public void approvePasswordRequest(Integer requestId) {
        PasswordRequest request = passwordRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Requête non trouvée"));

        request.setStatus(PasswordRequest.RequestStatus.APPROVED);
        Utilisateur user = request.getUtilisateur();
        user.setMotDePasse(request.getHashedPassword());
        utilisateurRepository.save(user);
        passwordRequestRepository.save(request);
    }

    public void rejectPasswordRequest(Integer requestId) {
        PasswordRequest request = passwordRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Requête non trouvée"));
        request.setStatus(PasswordRequest.RequestStatus.REJECTED);
        passwordRequestRepository.save(request);
    }

    public void updateUserStatus(Integer userId, Boolean active) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setActif(active);
        utilisateurRepository.save(user);
    }

    public java.util.List<Utilisateur> getAllUsers() {
        return utilisateurRepository.findAll();
    }

    public Utilisateur getUserById(Integer id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @org.springframework.transaction.annotation.Transactional
    public void updateUser(Integer userId, java.util.Map<String, String> updates) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if (updates.containsKey("nom"))
            user.setNom(updates.get("nom"));
        if (updates.containsKey("prenom"))
            user.setPrenom(updates.get("prenom"));
        if (updates.containsKey("email"))
            user.setEmail(updates.get("email"));
        utilisateurRepository.save(user);

        // Handle role change via native SQL
        if (updates.containsKey("role")) {
            String newRole = updates.get("role");
            String currentRole = (String) entityManager
                    .createNativeQuery("SELECT role FROM utilisateur WHERE id_utilisateur = :id")
                    .setParameter("id", userId)
                    .getSingleResult();

            if (!newRole.equals(currentRole)) {
                // Delete from old subclass table
                entityManager
                        .createNativeQuery("DELETE FROM " + currentRole.toLowerCase() + " WHERE id_utilisateur = :id")
                        .setParameter("id", userId).executeUpdate();
                // Insert into new subclass table
                entityManager
                        .createNativeQuery("INSERT INTO " + newRole.toLowerCase() + " (id_utilisateur) VALUES (:id)")
                        .setParameter("id", userId).executeUpdate();
                // Update discriminator
                entityManager.createNativeQuery("UPDATE utilisateur SET role = :role WHERE id_utilisateur = :id")
                        .setParameter("role", newRole).setParameter("id", userId).executeUpdate();
            }
        }
    }
}

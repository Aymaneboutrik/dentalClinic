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

        // 4. Vérifier s'il y a des demandes de réinitialisation acceptées ou refusées par le dentiste
        String notification = null;
        boolean passwordResetApproved = false;

        // Vérifier les demandes APPROUVÉES (non encore notifiées)
        java.util.List<PasswordRequest> approvedRequests = passwordRequestRepository
                .findByUtilisateurAndStatusAndNotified(user, PasswordRequest.RequestStatus.APPROVED, false);

        if (!approvedRequests.isEmpty()) {
            // Vérifier si c'est une demande de type RESET
            boolean hasReset = approvedRequests.stream()
                    .anyMatch(r -> r.getType() == PasswordRequest.RequestType.RESET);
            if (hasReset) {
                notification = "Votre demande de réinitialisation de mot de passe a été approuvée. Vous pouvez maintenant définir un nouveau mot de passe depuis votre profil.";
                passwordResetApproved = true;
            } else {
                notification = "Votre demande de changement de mot de passe a été approuvée.";
                // Pour un changement simple (pas reset), on peut le marquer comme notifié ici
                // car il n'y a pas d'action bloquante attendue.
                for (PasswordRequest pr : approvedRequests) {
                    pr.setNotified(true);
                    passwordRequestRepository.save(pr);
                }
            }
        } else {
            // Sinon, vérifier les demandes REJECTÉES
            java.util.List<PasswordRequest> rejectedRequests = passwordRequestRepository
                    .findByUtilisateurAndStatusAndNotified(user, PasswordRequest.RequestStatus.REJECTED, false);

            if (!rejectedRequests.isEmpty()) {
                boolean hasReset = rejectedRequests.stream()
                        .anyMatch(r -> r.getType() == PasswordRequest.RequestType.RESET);
                if (hasReset) {
                    notification = "Votre demande de réinitialisation de mot de passe a été refusée par le dentiste.";
                } else {
                    notification = "Votre demande de changement de mot de passe a été refusée par le dentiste.";
                }
                // Supprimé: pr.setNotified(true) ici pour laisser le message persister jusqu'à action manuelle
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
        response.put("email", user.getEmail()); // Add the user's email as well
        if (notification != null) {
            response.put("notification", notification);
        }
        response.put("passwordResetApproved", passwordResetApproved);
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

    public void changePassword(Integer userId, String oldPassword, String newPassword) {
        // 1. Trouver l'utilisateur dans la base
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 2. Vérifier si l'ancien mot de passe saisi est correct
        if (!passwordEncoder.matches(oldPassword, user.getMotDePasse())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }

        String hashed = passwordEncoder.encode(newPassword);

        // 3. Le dentiste change directement ; les autres passent par une demande
        if (Hibernate.getClass(user).equals(Dentiste.class)) {
            user.setMotDePasse(hashed);
            utilisateurRepository.save(user);
        } else {
            PasswordRequest request = new PasswordRequest();
            request.setUtilisateur(user);
            request.setHashedPassword(hashed);
            request.setType(PasswordRequest.RequestType.CHANGE);
            request.setStatus(PasswordRequest.RequestStatus.PENDING);
            passwordRequestRepository.save(request);
            throw new RuntimeException(
                    "Votre demande de changement de mot de passe a été envoyée. Veuillez attendre la validation par le Dentiste.");
        }
    }

    /**
     * Crée une demande de réinitialisation de mot de passe (type RESET) sans fournir de nouveau mot de passe.
     * Le dentiste doit approuver avant que la secrétaire/assistante puisse changer son mot de passe.
     */
    @org.springframework.transaction.annotation.Transactional
    public void requestPasswordResetForUser(Integer userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifie qu'il n'y a pas déjà une demande PENDING pour cet utilisateur
        java.util.List<PasswordRequest> pending = passwordRequestRepository
                .findByUtilisateurAndStatus(user, PasswordRequest.RequestStatus.PENDING);
        
        // Si une demande existe déjà, on ne fait rien (ou on pourrait lever une erreur)
        if (pending.isEmpty()) {
            PasswordRequest request = new PasswordRequest();
            request.setUtilisateur(user);
            request.setHashedPassword(null); // Pas de nouveau MDP à ce stade
            request.setType(PasswordRequest.RequestType.RESET);
            request.setStatus(PasswordRequest.RequestStatus.PENDING);
            passwordRequestRepository.save(request);
        }
    }

    /**
     * Permet à une secrétaire/assistante de définir un nouveau mot de passe après que le dentiste
     * ait approuvé sa demande de réinitialisation. Aucune validation dentiste supplémentaire requise.
     */
    @org.springframework.transaction.annotation.Transactional
    public void changePasswordAfterApproval(Integer userId, String oldPassword, String newPassword) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Si l'ancien mot de passe est fourni, on le vérifie (sécurité supplémentaire)
        if (oldPassword != null && !oldPassword.isEmpty()) {
            if (!passwordEncoder.matches(oldPassword, user.getMotDePasse())) {
                throw new RuntimeException("L'ancien mot de passe est incorrect.");
            }
        }

        // Chercher une demande RESET approuvée pour cet utilisateur
        java.util.List<PasswordRequest> approved = passwordRequestRepository
                .findByUtilisateurAndStatusAndType(user, PasswordRequest.RequestStatus.APPROVED, PasswordRequest.RequestType.RESET);

        if (approved.isEmpty()) {
            throw new RuntimeException("Aucune demande de réinitialisation approuvée trouvée pour cet utilisateur.");
        }

        // Changer le mot de passe directement
        user.setMotDePasse(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(user);

        // Marquer toutes les demandes approuvées comme notifiées
        for (PasswordRequest pr : approved) {
            pr.setNotified(true);
            passwordRequestRepository.save(pr);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void markNotificationsAsSeen(Integer userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        java.util.List<PasswordRequest> pending = passwordRequestRepository.findByUtilisateurAndNotified(user, false);
        for (PasswordRequest pr : pending) {
            pr.setNotified(true);
            passwordRequestRepository.save(pr);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public String requestPasswordReset(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec cet email"));

        if (Hibernate.getClass(user).equals(Dentiste.class)) {
            // Nettoyer les anciens jetons de cet utilisateur s'il y en a
            passwordResetTokenRepository.deleteByUtilisateur(user);
            passwordResetTokenRepository.flush(); // Force la suppression immédiate

            // Générer un nouveau jeton aléatoire
            // Un Dentiste peut réinitialiser son mot de passe par e-mail
            String token = java.util.UUID.randomUUID().toString();
            createPasswordResetTokenForUser(user, token);
            emailService.sendPasswordResetEmail(user.getEmail(), token);
            return "DENTIST_EMAIL_SENT";
        } else {
            // On retourne un code spécifique pour que le contrôleur affiche le bon message
            return "NON_DENTIST";
        }
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

        // Pour les demandes CHANGE (avec hashedPassword), appliquer immédiatement
        // Pour les demandes RESET, ne pas changer le mot de passe — la secrétaire le fera elle-même
        if (request.getType() == PasswordRequest.RequestType.CHANGE && request.getHashedPassword() != null) {
            Utilisateur user = request.getUtilisateur();
            user.setMotDePasse(request.getHashedPassword());
            utilisateurRepository.save(user);
        }

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

    @org.springframework.transaction.annotation.Transactional
    public void resetPasswordDirectly(Integer userId, String newPassword) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Seules les secrétaires et assistantes peuvent être réinitialisées directement par le dentiste
        if (Hibernate.getClass(user).equals(Dentiste.class)) {
            throw new RuntimeException("Le mot de passe du Dentiste ne peut pas être réinitialisé directement. Utilisez la récupération par email.");
        }

        user.setMotDePasse(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(user);

        // On nettoie aussi toutes les demandes de mot de passe en cours pour cet utilisateur
        java.util.List<PasswordRequest> pending = passwordRequestRepository.findByUtilisateurAndStatus(user, PasswordRequest.RequestStatus.PENDING);
        for (PasswordRequest pr : pending) {
            pr.setStatus(PasswordRequest.RequestStatus.APPROVED);
            pr.setNotified(true);
            passwordRequestRepository.save(pr);
        }
    }

    private void createPasswordResetTokenForUser(Utilisateur user, String token) {
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(15);
        PasswordResetToken myToken = new PasswordResetToken(token, user, expiryDate);
        passwordResetTokenRepository.save(myToken);
    }
}

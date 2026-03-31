package com.javaguides.auth_service.models; // Définition du package (adresse du fichier dans le projet)

import jakarta.persistence.*; // Importation des annotations pour la base de données
import org.hibernate.annotations.Formula; // Importation pour utiliser des requêtes SQL personnalisées dans le code
import java.time.LocalDateTime; // Importation pour gérer les dates et heures

@Entity // Indique que cette classe correspond à une table dans la base de données
@Table(name = "utilisateur") // Nom exact de la table dans PostgreSQL
@Inheritance(strategy = InheritanceType.JOINED) // Stratégie pour gérer les sous-classes (Dentiste, Assistant, etc.)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING) // Colonne qui définit le type
                                                                                  // d'utilisateur
public abstract class Utilisateur { // Classe "parente" (on ne peut pas créer un Utilisateur "pur", il doit être
                                    // Dentiste, etc.)

    @Id // Indique que c'est la clé primaire
    @GeneratedValue(strategy = GenerationType.IDENTITY) // La base de données gère l'auto-incrémentation (1, 2, 3...)
    @Column(name = "id_utilisateur") // Nom de la colonne exacte dans la base de données
    private Integer idUtilisateur; // Variable Java pour stocker l'ID

    @Formula("(SELECT u.role FROM utilisateur u WHERE u.id_utilisateur = id_utilisateur)") // Récupère le type
                                                                                           // d'utilisateur via SQL
    private String role; // Variable pour stocker le rôle (Dentiste, Secretaire, etc.)

    @Column(nullable = false, length = 50) // Colonne obligatoire, max 50 caractères
    private String nom; // Variable pour le nom

    @Column(nullable = false, length = 50) // Colonne obligatoire, max 50 caractères
    private String prenom; // Variable pour le prénom

    @Column(nullable = false, length = 100, unique = true) // Obligatoire, max 100, et l'email doit être unique
    private String email; // Variable pour l'email (identifiant de connexion)

    @Column(name = "mot_de_passe", nullable = false) // Nom de colonne différent du nom de variable, obligatoire
    private String motDePasse; // Variable pour le mot de passe (haché)

    @Column(nullable = false) // Colonne obligatoire
    private Boolean actif = true; // Par défaut, un nouvel utilisateur est actif

    @Column(name = "date_creation", insertable = false, updatable = false) // Géré par la DB, on ne peut pas le modifier
                                                                           // manuellement
    @Temporal(TemporalType.TIMESTAMP) // Précise que c'est une date avec heure
    private LocalDateTime dateCreation; // Variable pour la date de création du compte

    @Column(name = "tentatives_connexion")
    private Integer tentativesConnexion = 0; // Nombre d'essais ratés

    @Column(name = "date_verrouillage")
    private LocalDateTime dateVerrouillage; // Heure à laquelle le compte a été bloqué

    @PrePersist // S'exécute juste avant l'enregistrement dans la base de données
    protected void onCreate() { // Méthode de préparation
        if (dateCreation == null) { // Si la date n'est pas encore définie
            dateCreation = LocalDateTime.now(); // On met la date actuelle
        }
    }

    public Integer getIdUtilisateur() {
        return idUtilisateur;
    }

    public void setIdUtilisateur(Integer idUtilisateur) {
        this.idUtilisateur = idUtilisateur;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMotDePasse() {
        return motDePasse;
    }

    public void setMotDePasse(String motDePasse) {
        this.motDePasse = motDePasse;
    }

    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Integer getTentativesConnexion() {
        return tentativesConnexion;
    }

    public void setTentativesConnexion(Integer tentativesConnexion) {
        this.tentativesConnexion = tentativesConnexion;
    }

    public LocalDateTime getDateVerrouillage() {
        return dateVerrouillage;
    }

    public void setDateVerrouillage(LocalDateTime dateVerrouillage) {
        this.dateVerrouillage = dateVerrouillage;
    }

    public String getRole() {
        return role;
    }
}

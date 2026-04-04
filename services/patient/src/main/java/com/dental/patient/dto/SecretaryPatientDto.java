package com.dental.patient.dto;

import lombok.*;
import java.time.LocalDate;

/**
 * DTO restreint pour la secrétaire (données administratives uniquement).
 * Sans groupe sanguin ni contenu clinique du dossier ; {@code id} et {@code dossierId}
 * servent uniquement à enchaîner vers historique / documents.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecretaryPatientDto {
    /** Identifiant patient (technique) — utile après liste ou recherche. */
    private Long id;
    /** Identifiant du dossier médical — pour upload / liste documents côté secrétaire. */
    private Long dossierId;

    @jakarta.validation.constraints.NotBlank(message = "Le nom est obligatoire")
    private String nom;
    
    @jakarta.validation.constraints.NotBlank(message = "Le prénom est obligatoire")
    private String prenom;
    
    @jakarta.validation.constraints.NotNull(message = "La date de naissance est obligatoire")
    private java.time.LocalDate dateNaissance;
    
    @jakarta.validation.constraints.Size(min = 8, max = 15, message = "Le numéro de téléphone doit être entre 8 et 15 caractères")
    private String telephone;
    
    @jakarta.validation.constraints.Email(message = "Format d'email invalide")
    private String email;
    
    @jakarta.validation.constraints.NotBlank(message = "Le CIN est obligatoire")
    private String cin;
    
    private String sexe;
    private String profession;
}

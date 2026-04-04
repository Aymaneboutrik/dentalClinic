package com.dental.patient.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDto {
    private Long id;
    
    @jakarta.validation.constraints.NotBlank(message = "Le nom est obligatoire")
    private String nom;
    
    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;
    
    @NotNull(message = "La date de naissance est obligatoire")
    private LocalDate dateNaissance;
    
    private String adresse;
    
    @Size(min = 8, max = 15, message = "Le numéro de téléphone doit être entre 8 et 15 caractères")
    private String telephone;
    
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotBlank(message = "Le CIN est obligatoire")
    private String cin;
    
    private String sexe;
    private String profession;
    private String groupeSanguin;
    private DossierMedicalDto dossierMedical;
}

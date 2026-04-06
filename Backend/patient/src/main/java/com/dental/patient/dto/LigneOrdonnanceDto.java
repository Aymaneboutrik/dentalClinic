package com.dental.patient.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneOrdonnanceDto {
    @NotBlank(message = "Le nom du médicament est obligatoire")
    private String medicament;
    
    @NotBlank(message = "Le dosage est obligatoire")
    private String dosage;
    
    private String duree;
    private String instructions;
}

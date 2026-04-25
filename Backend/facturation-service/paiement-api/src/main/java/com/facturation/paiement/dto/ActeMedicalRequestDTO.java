package com.facturation.paiement.dto;

import com.facturation.paiement.enums.TypeActe;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActeMedicalRequestDTO {
    @NotBlank(message = "Le libellé est obligatoire")
    private String libelle;

    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private Double prix;

    @NotNull(message = "Le type d'acte est obligatoire")
    private TypeActe typeActe;
}

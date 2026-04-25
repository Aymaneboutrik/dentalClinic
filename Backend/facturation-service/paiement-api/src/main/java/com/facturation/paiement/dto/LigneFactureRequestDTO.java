package com.facturation.paiement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LigneFactureRequestDTO {

    @NotNull(message = "L'ID de la facture est obligatoire")
    private Long factureId;

    @NotNull(message = "L'ID de l'acte médical est obligatoire")
    private Long acteMedicalId;

    @NotNull(message = "La quantité est obligatoire")
    @Positive(message = "La quantité doit être positive")
    private Integer quantite;
}

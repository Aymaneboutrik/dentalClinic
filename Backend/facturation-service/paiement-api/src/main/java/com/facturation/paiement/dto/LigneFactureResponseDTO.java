package com.facturation.paiement.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LigneFactureResponseDTO {
    private Long id;
    private Long factureId;
    private Long acteMedicalId;
    private String libelleActe;
    private Integer quantite;
    private Double prixUnitaire;
    private Double sousTotal;
}

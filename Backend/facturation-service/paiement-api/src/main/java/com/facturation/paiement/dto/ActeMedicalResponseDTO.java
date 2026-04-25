package com.facturation.paiement.dto;

import com.facturation.paiement.enums.TypeActe;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActeMedicalResponseDTO {
    private Long id;
    private String libelle;
    private Double prix;
    private TypeActe typeActe;
}

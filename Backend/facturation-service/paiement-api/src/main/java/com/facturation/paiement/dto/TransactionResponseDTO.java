package com.facturation.paiement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransactionResponseDTO {
    private Long id;
    private LocalDateTime date;
    private Double montantAvant;
    private Double montantApres;
    private Double montantRemise;
    private Long remiseId;
    private Long factureId;
}

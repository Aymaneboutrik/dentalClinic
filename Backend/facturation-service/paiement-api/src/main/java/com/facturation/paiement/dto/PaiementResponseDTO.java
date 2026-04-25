package com.facturation.paiement.dto;

import com.facturation.paiement.enums.ModePaiement;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaiementResponseDTO {
    private Long id;
    private LocalDate datePaiement;
    private Double montant;
    private ModePaiement modePaiement;

    private Long factureId;
}

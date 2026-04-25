package com.facturation.paiement.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;
import com.facturation.paiement.enums.StatutFacture;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactureResponseDTO {
    private Long id;
    private Double montantBrut;
    private Double montantNet;
    private Double totalRemises;
    private Double totalPaye;
    private Double resteAPayer;
    private StatutFacture statut;
    private LocalDate date;
    private List<LigneFactureResponseDTO> lignesFacture;
    private List<PaiementResponseDTO> paiements;
}

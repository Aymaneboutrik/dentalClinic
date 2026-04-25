package com.facturation.paiement.dto;

import com.facturation.paiement.enums.ModePaiement;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaiementRequestDTO {
    @NotNull(message = "La date de paiement est obligatoire")
    private LocalDate datePaiement;

    @NotNull(message = "Le montant est obligatoire")
    @Positive(message = "Le montant doit être positif")
    private Double montant;

    @NotNull(message = "Le mode de paiement est obligatoire")
    private ModePaiement modePaiement;



    @NotNull(message = "L'ID de la facture est obligatoire")
    private Long factureId;
}

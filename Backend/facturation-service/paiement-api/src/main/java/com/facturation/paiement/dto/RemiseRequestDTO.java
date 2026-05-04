package com.facturation.paiement.dto;

import com.facturation.paiement.enums.TypeRemise;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RemiseRequestDTO {
    @NotNull(message = "La valeur est obligatoire")
    @Positive(message = "La valeur doit être positive")
    private Double valeur;

    private LocalDate dateRemise;

    private String description;

    @NotNull(message = "Le type de remise est obligatoire")
    private TypeRemise typeRemise;

    @NotNull(message = "L'ID de la facture est obligatoire")
    private Long factureId;

    private Boolean estAutorisee;
}

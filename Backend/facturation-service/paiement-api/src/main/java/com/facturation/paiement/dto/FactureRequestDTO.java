package com.facturation.paiement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactureRequestDTO {
    @NotNull(message = "La date est obligatoire")
    private LocalDate date;

}

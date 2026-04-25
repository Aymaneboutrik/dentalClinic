package com.facturation.paiement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransactionRequestDTO {
    @NotNull
    private LocalDateTime date;
    @NotNull
    private Double montantAvant;
    @NotNull
    private Double montantApres;
    @NotNull
    private Double montantRemise;
    @NotNull
    private Long remiseId;
}

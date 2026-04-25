package com.facturation.paiement.dto;

import com.facturation.paiement.enums.TypeRemise;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RemiseResponseDTO {
    private Long id;
    private Double valeur;
    private LocalDate dateRemise;
    private String description;
    private TypeRemise typeRemise;
    private Long factureId;
    private Double montantCalcule;
    private Boolean estAutorisee;
}

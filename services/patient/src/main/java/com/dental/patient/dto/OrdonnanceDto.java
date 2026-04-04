package com.dental.patient.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdonnanceDto {
    @NotNull(message = "La date de l'ordonnance est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateOrdonnance;
    
    @NotEmpty(message = "L'ordonnance doit contenir au moins une ligne")
    @Valid
    private List<LigneOrdonnanceDto> lignes;
}

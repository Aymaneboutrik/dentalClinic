package com.dental.patient.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObservationDto {
    private Long id;
    
    @NotBlank(message = "Le contenu de l'observation est obligatoire")
    private String contenu;

    private String typeAuteur;
    
    @NotNull(message = "La date de l'observation est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateObservation;
}

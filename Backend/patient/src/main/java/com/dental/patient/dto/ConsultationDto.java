package com.dental.patient.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationDto {
    private Long id;

    @NotNull(message = "La date de consultation est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateConsultation;
    
    @NotBlank(message = "Le motif est obligatoire")
    private String motif;
    
    private List<ObservationDto> observations;
    private List<ActeDto> actes;
}

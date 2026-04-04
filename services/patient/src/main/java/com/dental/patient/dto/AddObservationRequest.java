package com.dental.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddObservationRequest {

    @NotBlank(message = "Le contenu de l'observation est obligatoire")
    private String contenu;
}

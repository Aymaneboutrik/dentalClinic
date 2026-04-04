package com.dental.patient.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateConsultationRequest {
    private String motif;
    private String observation;
}

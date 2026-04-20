package com.dental.patient.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActeDto {
    private Long id;
    private String description;
    private BigDecimal prix;
}

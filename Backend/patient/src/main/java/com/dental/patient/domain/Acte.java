package com.dental.patient.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "actes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Acte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal prix;
}

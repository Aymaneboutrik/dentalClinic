package com.dental.patient.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lignes_ordonnance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneOrdonnance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String medicament;

    private String dosage;

    private String frequence;

    private String duree;

    @ManyToOne
    @JoinColumn(name = "ordonnance_id")
    @JsonBackReference("ordonnance-ligne")
    private Ordonnance ordonnance;
}

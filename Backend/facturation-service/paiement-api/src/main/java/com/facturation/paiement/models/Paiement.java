package com.facturation.paiement.models;

import com.facturation.paiement.enums.ModePaiement;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "paiement")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_paiement", nullable = false)
    private LocalDate datePaiement;

    @Column(name = "montant", nullable = false)
    private Double montant;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement", nullable = false)
    private ModePaiement modePaiement;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_id", nullable = false)
    private Facture facture;
}

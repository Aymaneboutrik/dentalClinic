package com.facturation.paiement.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "montant_avant", nullable = false)
    private Double montantAvant;

    @Column(name = "montant_apres", nullable = false)
    private Double montantApres;

    @Column(name = "montant_remise", nullable = false)
    private Double montantRemise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remise_id")
    private Remise remise;

    @Column(name = "facture_id")
    private Long factureId;
}

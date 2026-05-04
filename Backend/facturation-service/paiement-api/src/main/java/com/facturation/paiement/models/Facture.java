package com.facturation.paiement.models;

import com.facturation.paiement.enums.StatutFacture;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "facture")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "montant_brut", nullable = false)
    @Builder.Default
    private Double montantBrut = 0.0;

    @Column(name = "montant_net", nullable = false)
    @Builder.Default
    private Double montantNet = 0.0;

    @Column(name = "total_paye", nullable = false)
    @Builder.Default
    private Double totalPaye = 0.0;

    @Column(name = "reste_a_payer", nullable = false)
    @Builder.Default
    private Double resteAPayer = 0.0;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private StatutFacture statut = StatutFacture.IMPAYE;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LigneFacture> lignesFacture = new ArrayList<>();

    @OneToMany(mappedBy = "facture", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Paiement> paiements = new ArrayList<>();

    @OneToMany(mappedBy = "facture", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Remise> remises = new ArrayList<>();
}

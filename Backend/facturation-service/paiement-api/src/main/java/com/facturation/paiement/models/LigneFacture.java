package com.facturation.paiement.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ligne_facture")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LigneFacture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_id", nullable = false)
    private Facture facture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acte_medical_id", nullable = false)
    private ActeMedical acteMedical;

    @Column(name = "quantite", nullable = false)
    private Integer quantite;

    @Column(name = "prix_unitaire", nullable = false)
    private Double prixUnitaire;

    @Column(name = "sous_total", nullable = false)
    private Double sousTotal;

    public void calculateSousTotal() {
        this.sousTotal = (this.quantite != null && this.prixUnitaire != null)
                ? this.quantite * this.prixUnitaire
                : 0.0;
    }
}

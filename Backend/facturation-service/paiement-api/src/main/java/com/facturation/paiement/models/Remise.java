package com.facturation.paiement.models;

import com.facturation.paiement.enums.TypeRemise;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "remise")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Remise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "valeur", nullable = false)
    private Double valeur;

    @Column(name = "date_remise", nullable = false)
    private LocalDate dateRemise;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_remise", nullable = false)
    private TypeRemise typeRemise;

    @Column(name = "est_autorisee", nullable = false)
    @Builder.Default
    private Boolean estAutorisee = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_id", nullable = false)
    private Facture facture;

    @OneToMany(mappedBy = "remise", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Transaction> transactions = new ArrayList<>();

    /**
     * Méthode principale : calcule le montant de la remise selon son type.
     * - FIXE    : retourne valeur (montant fixe à déduire, ex: 50 MAD)
     * - VARIABLE: retourne total * valeur / 100 (pourcentage, ex: 10%)
     */
    public Double calculerMontant(Double total) {
        if (typeRemise == TypeRemise.FIXE) {
            return valeur;
        } else {
            return total * valeur / 100.0;
        }
    }
}

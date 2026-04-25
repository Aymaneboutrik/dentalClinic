package com.facturation.paiement.dto;

import com.facturation.paiement.enums.StatutFacture;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO dédié à l'affichage complet d'une fiche facture.
 * Regroupe toutes les informations nécessaires en un seul objet :
 * infos principales, lignes, remises, paiements et récapitulatif financier.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FicheFactureDTO {

    // ─── Informations principales de la facture ───────────────────────────────
    private Long id;
    private LocalDate date;
    private StatutFacture statut;

    // ─── Détail des actes / lignes de facture ─────────────────────────────────
    private List<LigneFactureResponseDTO> lignesFacture;

    // ─── Remises appliquées (toutes : autorisées et non autorisées) ───────────
    private List<RemiseResponseDTO> remises;

    // ─── Paiements effectués ──────────────────────────────────────────────────
    private List<PaiementResponseDTO> paiements;

    // ─── Récapitulatif financier ──────────────────────────────────────────────
    /** Somme brute des actes médicaux (avant toute remise) */
    private Double montantBrut;

    /** Somme des remises autorisées (effectivement déduites) */
    private Double totalRemises;

    /** Montant net à payer après déduction des remises autorisées */
    private Double montantNet;

    /** Total déjà encaissé */
    private Double totalPaye;

    /** Solde restant à régler (ne peut jamais être négatif) */
    private Double resteAPayer;
}

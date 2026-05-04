package com.facturation.paiement.services;

import com.facturation.paiement.dto.FactureRequestDTO;
import com.facturation.paiement.dto.FactureResponseDTO;
import com.facturation.paiement.dto.FicheFactureDTO;
import com.facturation.paiement.dto.LigneFactureResponseDTO;
import com.facturation.paiement.dto.PaiementResponseDTO;
import com.facturation.paiement.dto.RemiseResponseDTO;
import com.facturation.paiement.exceptions.IllegalInvoiceStateException;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.FactureMapper;
import com.facturation.paiement.mappers.LigneFactureMapper;
import com.facturation.paiement.mappers.PaiementMapper;
import com.facturation.paiement.mappers.RemiseMapper;
import com.facturation.paiement.notifications.NotificationService;
import com.facturation.paiement.enums.StatutFacture;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.Remise;
import com.facturation.paiement.repository.interfaces.LigneFactureRepositoryInterface;
import com.facturation.paiement.repository.interfaces.FactureRepositoryInterface;
import com.facturation.paiement.repository.interfaces.PaiementRepositoryInterface;
import com.facturation.paiement.repository.interfaces.RemiseRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FactureService {

    private final FactureRepositoryInterface factureRepository;
    private final LigneFactureRepositoryInterface ligneFactureRepository;
    private final PaiementRepositoryInterface paiementRepository;
    private final RemiseRepositoryInterface remiseRepository;
    private final FactureMapper factureMapper;
    private final LigneFactureMapper ligneFactureMapper;
    private final PaiementMapper paiementMapper;
    private final RemiseMapper remiseMapper;
    private final NotificationService notificationService;

    @Transactional
    public FactureResponseDTO create(FactureRequestDTO dto) {
        Facture facture = factureMapper.toEntity(dto);
        facture.setDate(java.time.LocalDate.now());
        facture.setMontantBrut(0.0);
        facture.setMontantNet(0.0);
        facture.setTotalPaye(0.0);
        facture.setResteAPayer(0.0);
        facture.setStatut(StatutFacture.IMPAYE);
        Facture saved = factureRepository.save(facture);
        if (saved.getStatut() == StatutFacture.IMPAYE) {
            notificationService.alerteCritiqueFactureImpayee(saved.getId());
        }
        return factureMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public FactureResponseDTO findById(Long id) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable avec l'ID : " + id));
        return factureMapper.toDto(facture);
    }

    @Transactional(readOnly = true)
    public List<FactureResponseDTO> findAll() {
        return factureRepository.findAll().stream()
                .map(factureMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FactureResponseDTO update(Long id, FactureRequestDTO dto) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable avec l'ID : " + id));
        
        if (facture.getStatut() != StatutFacture.IMPAYE) {
             throw new IllegalInvoiceStateException("Impossible de modifier la facture : elle n'est plus en état IMPAYÉE (déjà partiellement ou totalement réglée).");
        }

        factureMapper.updateFromDto(dto, facture);
        recalculateFinancialsAndStatus(facture);
        Facture updated = factureRepository.save(facture);
        if (updated.getStatut() == StatutFacture.IMPAYE) {
            notificationService.alerteCritiqueFactureImpayee(updated.getId());
        }
        return factureMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!factureRepository.existsById(id)) {
            throw new ResourceNotFoundException("Facture introuvable avec l'ID : " + id);
        }
        factureRepository.deleteById(id);
    }

    public Facture getEntityById(Long id) {
        return factureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable avec l'ID : " + id));
    }

    /**
     * Construit la fiche complète d'une facture :
     * infos principales + lignes + remises (avec montantCalcule) + paiements + récapitulatif financier.
     */
    @Transactional(readOnly = true)
    public FicheFactureDTO getFicheFacture(Long factureId) {
        Facture facture = getEntityById(factureId);

        // Lignes de facture
        List<LigneFactureResponseDTO> lignes = facture.getLignesFacture() != null
                ? facture.getLignesFacture().stream()
                        .map(ligneFactureMapper::toDto)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        // Remises avec montantCalcule rempli
        List<RemiseResponseDTO> remises = facture.getRemises() != null
                ? facture.getRemises().stream()
                  .distinct()
                  .map(r -> {
                        RemiseResponseDTO dto = remiseMapper.toDto(r);
                        dto.setMontantCalcule(r.calculerMontant(facture.getMontantBrut()));
                        return dto;
                  }).collect(Collectors.toList())
                : Collections.emptyList();

        // Paiements
        List<PaiementResponseDTO> paiements = facture.getPaiements() != null
                ? facture.getPaiements().stream()
                        .map(paiementMapper::toDto)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        // Récapitulatif financier (réutilise la logique Brut/Net déjà en place)
        Double montantBrut = facture.getMontantBrut() != null ? facture.getMontantBrut() : 0.0;
        Double montantNet  = facture.getMontantNet()  != null ? facture.getMontantNet()  : 0.0;

        Double currentMontantForRemise = montantBrut;
        Double totalRemisesAutorisees = 0.0;
        if (facture.getRemises() != null) {
            for (Remise r : facture.getRemises()) {
                if (Boolean.TRUE.equals(r.getEstAutorisee())) {
                    Double amount = r.calculerMontant(currentMontantForRemise);
                    totalRemisesAutorisees += amount;
                    currentMontantForRemise -= amount;
                }
            }
        }
        totalRemisesAutorisees = Math.min(montantBrut, totalRemisesAutorisees);

        Double totalPaye = paiements.stream()
                .mapToDouble(p -> p.getMontant() != null ? p.getMontant() : 0.0)
                .sum();

        Double resteAPayer = Math.max(0.0, montantNet - totalPaye);

        return FicheFactureDTO.builder()
                .id(facture.getId())
                .date(facture.getDate())
                .statut(facture.getStatut())
                .lignesFacture(lignes)
                .remises(remises)
                .paiements(paiements)
                .montantBrut(montantBrut)
                .totalRemises(totalRemisesAutorisees)
                .montantNet(montantNet)
                .totalPaye(totalPaye)
                .resteAPayer(resteAPayer)
                .build();
    }

    @Transactional
    public void recalculateFinancialsAndStatus(Long factureId) {
        Facture facture = getEntityById(factureId);
        recalculateFinancialsAndStatus(facture);
        factureRepository.save(facture);
    }

    public Double calculateCurrentResteAPayer(Long factureId) {
        Facture facture = getEntityById(factureId);
        Double totalVente = (facture.getLignesFacture() != null)
                ? facture.getLignesFacture().stream()
                        .mapToDouble(lf -> lf.getSousTotal() != null ? lf.getSousTotal() : 0.0)
                        .sum()
                : 0.0;

        Double totalPaye = paiementRepository.findByFactureId(facture.getId()).stream()
                .map(p -> p.getMontant() != null ? p.getMontant() : 0.0)
                .reduce(0.0, Double::sum);
        Double montantNetTemp = totalVente;
        Double totalRemises = 0.0;
        List<Remise> remisesList = remiseRepository.findByFactureId(facture.getId());
        if (remisesList != null) {
            for (Remise r : remisesList) {
                if (Boolean.TRUE.equals(r.getEstAutorisee())) {
                    Double amount = computeRemiseAmount(r, montantNetTemp);
                    totalRemises += amount;
                    montantNetTemp -= amount;
                }
            }
        }
        return montantNetTemp - totalPaye;
    }

    private void recalculateFinancialsAndStatus(Facture facture) {
        Double totalVente = (facture.getLignesFacture() != null)
                ? facture.getLignesFacture().stream()
                        .mapToDouble(lf -> lf.getSousTotal() != null ? lf.getSousTotal() : 0.0)
                        .sum()
                : 0.0;
        facture.setMontantBrut(totalVente);

        Double totalPaye = paiementRepository.findByFactureId(facture.getId()).stream()
                .map(p -> p.getMontant() != null ? p.getMontant() : 0.0)
                .reduce(0.0, Double::sum);
        facture.setTotalPaye(totalPaye);

        Double montantNet = totalVente;
        Double totalRemises = 0.0;
        List<Remise> remisesList = remiseRepository.findByFactureId(facture.getId());
        if (remisesList != null) {
            for (Remise r : remisesList) {
                if (Boolean.TRUE.equals(r.getEstAutorisee())) {
                    Double amount = computeRemiseAmount(r, montantNet);
                    totalRemises += amount;
                    montantNet -= amount;
                }
            }
        }

        montantNet = Math.max(0.0, montantNet);
        facture.setMontantNet(montantNet);

        Double resteAPayer = montantNet - totalPaye;
        facture.setResteAPayer(resteAPayer);
        if (resteAPayer <= 0.0) {
            facture.setStatut(StatutFacture.PAYEE);
        } else if (totalPaye > 0.0) {
            facture.setStatut(StatutFacture.PARTIEL);
        } else {
            facture.setStatut(StatutFacture.IMPAYE);
        }
    }

    private Double computeRemiseAmount(Remise remise, Double montantTotal) {
        if (remise == null) {
            return 0.0;
        }
        Double amount = remise.calculerMontant(montantTotal != null ? montantTotal : 0.0);
        return amount != null ? amount : 0.0;
    }
}

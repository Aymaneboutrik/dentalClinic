package com.facturation.paiement.services;

import com.facturation.paiement.dto.PaiementRequestDTO;
import com.facturation.paiement.dto.PaiementResponseDTO;

import com.facturation.paiement.enums.StatutFacture;
import com.facturation.paiement.exceptions.IllegalInvoiceStateException;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.PaiementMapper;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.Paiement;

import com.facturation.paiement.repository.interfaces.PaiementRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaiementService {

    private final PaiementRepositoryInterface paiementRepository;
    private final FactureService factureService;
    private final PaiementMapper paiementMapper;


    @Transactional
    public PaiementResponseDTO create(PaiementRequestDTO dto) {
        Facture facture = factureService.getEntityById(dto.getFactureId());

        if (facture.getStatut() == StatutFacture.PAYEE) {
            throw new IllegalInvoiceStateException("Impossible d'ajouter un paiement : la facture est déjà PAYÉE.");
        }

        Double resteAPayer = factureService.calculateCurrentResteAPayer(facture.getId());
        if (dto.getMontant() != null && dto.getMontant() > resteAPayer) {
            throw new IllegalInvoiceStateException("Le montant du paiement (" + dto.getMontant() + ") dépasse le reste à payer (" + resteAPayer + ").");
        }

        Paiement paiement = paiementMapper.toEntity(dto);
        paiement.setFacture(facture);
        Paiement saved = paiementRepository.save(paiement);
        factureService.recalculateFinancialsAndStatus(facture.getId());
        return paiementMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public PaiementResponseDTO findById(Long id) {
        Paiement p = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable avec l'ID : " + id));
        return paiementMapper.toDto(p);
    }

    @Transactional(readOnly = true)
    public List<PaiementResponseDTO> findAll() {
        return paiementRepository.findAll().stream()
                .map(paiementMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaiementResponseDTO> findByFactureId(Long factureId) {
        return paiementRepository.findByFactureId(factureId).stream()
                .map(paiementMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public PaiementResponseDTO update(Long id, PaiementRequestDTO dto) {
        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable avec l'ID : " + id));
        Long oldFactureId = paiement.getFacture().getId();
        Long newFactureId = oldFactureId;

        if (dto.getFactureId() != null && !dto.getFactureId().equals(paiement.getFacture().getId())) {
            Facture facture = factureService.getEntityById(dto.getFactureId());
            if (facture.getStatut() == StatutFacture.PAYEE) {
                throw new IllegalInvoiceStateException("Impossible de déplacer un paiement vers une facture déjà PAYÉE.");
            }
            paiement.setFacture(facture);
            newFactureId = facture.getId();
        }

        if (paiement.getFacture().getStatut() == StatutFacture.PAYEE) {
            throw new IllegalInvoiceStateException("Impossible de modifier un paiement sur une facture déjà PAYÉE.");
        }

        Double resteAPayerSansCePaiement = factureService.calculateCurrentResteAPayer(newFactureId) + (paiement.getMontant() != null ? paiement.getMontant() : 0.0);
        if (dto.getMontant() != null && dto.getMontant() > resteAPayerSansCePaiement) {
             throw new IllegalInvoiceStateException("Le montant du paiement (" + dto.getMontant() + ") dépasse le reste à payer (" + resteAPayerSansCePaiement + ").");
        }

        paiementMapper.updateFromDto(dto, paiement);
        Paiement updated = paiementRepository.save(paiement);
        factureService.recalculateFinancialsAndStatus(newFactureId);
        if (!oldFactureId.equals(newFactureId)) {
            factureService.recalculateFinancialsAndStatus(oldFactureId);
        }
        return paiementMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable avec l'ID : " + id));
        
        if (paiement.getFacture().getStatut() == StatutFacture.PAYEE) {
            throw new IllegalInvoiceStateException("Impossible de supprimer un paiement d'une facture déjà PAYÉE.");
        }

        Long factureId = paiement.getFacture().getId();
        paiementRepository.deleteById(id);
        factureService.recalculateFinancialsAndStatus(factureId);
    }
}

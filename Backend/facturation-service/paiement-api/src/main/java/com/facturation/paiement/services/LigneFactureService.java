package com.facturation.paiement.services;

import com.facturation.paiement.dto.LigneFactureRequestDTO;
import com.facturation.paiement.dto.LigneFactureResponseDTO;
import com.facturation.paiement.dto.LigneFactureResponseDTO;
import com.facturation.paiement.enums.StatutFacture;
import com.facturation.paiement.exceptions.IllegalInvoiceStateException;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.LigneFactureMapper;
import com.facturation.paiement.models.ActeMedical;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.LigneFacture;
import com.facturation.paiement.repository.interfaces.LigneFactureRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LigneFactureService {

    private final LigneFactureRepositoryInterface ligneFactureRepository;
    private final FactureService factureService;
    private final ActeMedicalService acteMedicalService;
    private final LigneFactureMapper ligneFactureMapper;

    @Transactional
    public LigneFactureResponseDTO create(LigneFactureRequestDTO dto) {
        Facture facture = factureService.getEntityById(dto.getFactureId());
        
        if (facture.getStatut() != StatutFacture.IMPAYE) {
            throw new IllegalInvoiceStateException("Impossible d'ajouter une ligne : la facture n'est plus en état IMPAYÉE.");
        }

        ActeMedical acte = acteMedicalService.getEntityById(dto.getActeMedicalId());

        LigneFacture ligne = ligneFactureMapper.toEntity(dto);
        ligne.setFacture(facture);
        ligne.setActeMedical(acte);
        
        // Figer le prix automatique depuis le catalogue (STRICT)
        ligne.setPrixUnitaire(acte.getPrix());
        
        // Calculer le sous-total
        ligne.calculateSousTotal();

        LigneFacture saved = ligneFactureRepository.save(ligne);
        
        // Déclencher le recalcul de la facture
        factureService.recalculateFinancialsAndStatus(facture.getId());
        
        return ligneFactureMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public LigneFactureResponseDTO findById(Long id) {
        LigneFacture lf = ligneFactureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ligne de facture introuvable avec l'ID : " + id));
        return ligneFactureMapper.toDto(lf);
    }

    @Transactional(readOnly = true)
    public List<LigneFactureResponseDTO> findByFactureId(Long factureId) {
        return ligneFactureRepository.findByFactureId(factureId).stream()
                .map(ligneFactureMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public LigneFactureResponseDTO update(Long id, LigneFactureRequestDTO dto) {
        LigneFacture lf = ligneFactureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ligne de facture introuvable avec l'ID : " + id));

        if (lf.getFacture().getStatut() != StatutFacture.IMPAYE) {
            throw new IllegalInvoiceStateException("Impossible de modifier une ligne : la facture n'est plus en état IMPAYÉE.");
        }

        if (dto.getFactureId() != null && !dto.getFactureId().equals(lf.getFacture().getId())) {
            Facture facture = factureService.getEntityById(dto.getFactureId());
            lf.setFacture(facture);
        }
        
        if (dto.getActeMedicalId() != null && !dto.getActeMedicalId().equals(lf.getActeMedical().getId())) {
            ActeMedical acte = acteMedicalService.getEntityById(dto.getActeMedicalId());
            lf.setActeMedical(acte);
            lf.setPrixUnitaire(acte.getPrix()); // Mise à jour automatique obligatoire
        }

        if (dto.getQuantite() != null) {
            lf.setQuantite(dto.getQuantite());
        }

        lf.calculateSousTotal();
        LigneFacture updated = ligneFactureRepository.save(lf);
        
        factureService.recalculateFinancialsAndStatus(lf.getFacture().getId());
        
        return ligneFactureMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        LigneFacture lf = ligneFactureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ligne de facture introuvable avec l'ID : " + id));
        
        if (lf.getFacture().getStatut() != StatutFacture.IMPAYE) {
            throw new IllegalInvoiceStateException("Impossible de supprimer une ligne : la facture n'est plus en état IMPAYÉE.");
        }

        Long factureId = lf.getFacture().getId();
        ligneFactureRepository.deleteById(id);
        factureService.recalculateFinancialsAndStatus(factureId);
    }
}

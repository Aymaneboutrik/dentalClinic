package com.facturation.paiement.services;

import com.facturation.paiement.dto.RemiseRequestDTO;
import com.facturation.paiement.dto.RemiseResponseDTO;
import com.facturation.paiement.dto.RemiseResponseDTO;
import com.facturation.paiement.enums.StatutFacture;
import com.facturation.paiement.exceptions.IllegalInvoiceStateException;
import com.facturation.paiement.exceptions.RemiseException;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.RemiseMapper;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.Remise;
import com.facturation.paiement.models.Transaction;
import com.facturation.paiement.repository.interfaces.RemiseRepositoryInterface;
import com.facturation.paiement.repository.interfaces.TransactionRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RemiseService {

    private final RemiseRepositoryInterface remiseRepository;
    private final TransactionRepositoryInterface transactionRepository;
    private final FactureService factureService;
    private final RemiseMapper remiseMapper;

    @Transactional
    public RemiseResponseDTO create(RemiseRequestDTO dto) {
        Facture facture = factureService.getEntityById(dto.getFactureId());

        if (facture.getStatut() != StatutFacture.IMPAYE) {
            throw new IllegalInvoiceStateException("Impossible d'ajouter une remise : la facture n'est plus en état IMPAYÉE.");
        }

        Remise remise = remiseMapper.toEntity(dto);
        remise.setFacture(facture);
        Remise saved = remiseRepository.save(remise);

        // Tracer la transaction de création de remise
        Double totalBrut = facture.getMontantBrut();
        Double montantRemise = saved.calculerMontant(totalBrut);

        if (montantRemise <= 0) {
            throw new RemiseException("Le montant calculé de la remise doit être supérieur à 0.");
        }

        // Si autorisée, le net change, sinon on reste sur le brut actuel (potentiel)
        Double totalNet = Math.max(0.0, totalBrut - (saved.getEstAutorisee() ? montantRemise : 0.0));
        Double impactReel = totalBrut - totalNet;

        Transaction transaction = Transaction.builder()
                .date(LocalDateTime.now())
                .montantAvant(totalBrut)
                .montantApres(totalNet)
                .montantRemise(impactReel)
                .remise(saved)
                .build();
        transactionRepository.save(transaction);

        // Recalculer le solde de la facture (prendra en compte estAutorisee)
        factureService.recalculateFinancialsAndStatus(facture.getId());

        RemiseResponseDTO responseDTO = remiseMapper.toDto(saved);
        responseDTO.setMontantCalcule(montantRemise);
        return responseDTO;
    }

    @Transactional(readOnly = true)
    public RemiseResponseDTO findById(Long id) {
        Remise remise = remiseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remise introuvable avec l'ID : " + id));
        RemiseResponseDTO dto = remiseMapper.toDto(remise);
        dto.setMontantCalcule(remise.calculerMontant(remise.getFacture().getMontantBrut()));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<RemiseResponseDTO> findAll() {
        return remiseRepository.findAll().stream().map(r -> {
            RemiseResponseDTO dto = remiseMapper.toDto(r);
            dto.setMontantCalcule(r.calculerMontant(r.getFacture().getMontantBrut()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RemiseResponseDTO> findByFactureId(Long factureId) {
        return remiseRepository.findByFactureId(factureId).stream().map(r -> {
            RemiseResponseDTO dto = remiseMapper.toDto(r);
            dto.setMontantCalcule(r.calculerMontant(r.getFacture().getMontantBrut()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public RemiseResponseDTO update(Long id, RemiseRequestDTO dto) {
        Remise remise = remiseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remise introuvable avec l'ID : " + id));
        Long oldFactureId = remise.getFacture().getId();
        Long newFactureId = oldFactureId;

        if (dto.getFactureId() != null && !dto.getFactureId().equals(remise.getFacture().getId())) {
            Facture facture = factureService.getEntityById(dto.getFactureId());
            if (facture.getStatut() != StatutFacture.IMPAYE) {
                throw new IllegalInvoiceStateException("Impossible de déplacer la remise : la destination n'est pas une facture IMPAYÉE.");
            }
            remise.setFacture(facture);
            newFactureId = facture.getId();
        }

        if (remise.getFacture().getStatut() != StatutFacture.IMPAYE) {
            throw new IllegalInvoiceStateException("Impossible de modifier une remise : la facture n'est plus en état IMPAYÉE.");
        }

        remiseMapper.updateFromDto(dto, remise);
        Remise updated = remiseRepository.save(remise);

        // Tracer la transaction de mise à jour
        Double totalBrut = updated.getFacture().getMontantBrut();
        Double montantRemise = updated.calculerMontant(totalBrut);

        if (montantRemise <= 0) {
            throw new RemiseException("Le montant calculé de la remise doit être supérieur à 0.");
        }

        Double totalNet = Math.max(0.0, totalBrut - (updated.getEstAutorisee() ? montantRemise : 0.0));
        Double impactReel = totalBrut - totalNet;

        Transaction transaction = Transaction.builder()
                .date(LocalDateTime.now())
                .montantAvant(totalBrut)
                .montantApres(totalNet)
                .montantRemise(impactReel)
                .remise(updated)
                .build();
        transactionRepository.save(transaction);

        factureService.recalculateFinancialsAndStatus(newFactureId);
        if (!oldFactureId.equals(newFactureId)) {
            factureService.recalculateFinancialsAndStatus(oldFactureId);
        }

        RemiseResponseDTO responseDTO = remiseMapper.toDto(updated);
        responseDTO.setMontantCalcule(montantRemise);
        return responseDTO;
    }

    @Transactional
    public void delete(Long id) {
        Remise remise = remiseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remise introuvable avec l'ID : " + id));

        if (remise.getFacture().getStatut() != StatutFacture.IMPAYE) {
            throw new IllegalInvoiceStateException("Impossible de supprimer une remise : la facture n'est plus en état IMPAYÉE.");
        }

        Long factureId = remise.getFacture().getId();
        remiseRepository.deleteById(id);
        factureService.recalculateFinancialsAndStatus(factureId);
    }

    public Remise getEntityById(Long id) {
        return remiseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remise introuvable avec l'ID : " + id));
    }
}
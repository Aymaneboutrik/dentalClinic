package com.facturation.paiement.services;

import com.facturation.paiement.dto.ActeMedicalRequestDTO;
import com.facturation.paiement.dto.ActeMedicalResponseDTO;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.ActeMedicalMapper;
import com.facturation.paiement.models.ActeMedical;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.LigneFacture;
import com.facturation.paiement.repository.interfaces.ActeMedicalRepositoryInterface;
import com.facturation.paiement.repository.interfaces.FactureRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActeMedicalService {

    private final ActeMedicalRepositoryInterface acteMedicalRepository;
    private final FactureRepositoryInterface factureRepository;
    private final ActeMedicalMapper acteMedicalMapper;

    @Transactional
    public ActeMedicalResponseDTO create(ActeMedicalRequestDTO dto) {
        ActeMedical acte = acteMedicalMapper.toEntity(dto);
        return acteMedicalMapper.toDto(acteMedicalRepository.save(acte));
    }

    @Transactional(readOnly = true)
    public ActeMedicalResponseDTO findById(Long id) {
        ActeMedical acte = acteMedicalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Acte médical introuvable avec l'ID : " + id));
        return acteMedicalMapper.toDto(acte);
    }

    @Transactional(readOnly = true)
    public List<ActeMedicalResponseDTO> findAll() {
        return acteMedicalRepository.findAll().stream()
                .map(acteMedicalMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ActeMedicalResponseDTO update(Long id, ActeMedicalRequestDTO dto) {
        ActeMedical acte = acteMedicalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Acte médical introuvable avec l'ID : " + id));
        acteMedicalMapper.updateFromDto(dto, acte);
        return acteMedicalMapper.toDto(acteMedicalRepository.save(acte));
    }

    @Transactional
    public void delete(Long id) {
        if (!acteMedicalRepository.existsById(id)) {
            throw new ResourceNotFoundException("Acte médical introuvable avec l'ID : " + id);
        }
        acteMedicalRepository.deleteById(id);
    }

    public ActeMedical getEntityById(Long id) {
        return acteMedicalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Acte médical introuvable avec l'ID : " + id));
    }

    @Transactional(readOnly = true)
    public List<ActeMedicalResponseDTO> findByFactureId(Long factureId) {
        Facture facture = factureRepository.findById(factureId)
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable avec l'ID : " + factureId));
        return facture.getLignesFacture().stream()
                .map(LigneFacture::getActeMedical)
                .map(acteMedicalMapper::toDto)
                .collect(Collectors.toList());
    }
}

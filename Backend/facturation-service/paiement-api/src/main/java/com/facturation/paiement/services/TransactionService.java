package com.facturation.paiement.services;

import com.facturation.paiement.dto.TransactionRequestDTO;
import com.facturation.paiement.dto.TransactionResponseDTO;
import com.facturation.paiement.exceptions.RemiseException;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.TransactionMapper;
import com.facturation.paiement.models.Remise;
import com.facturation.paiement.models.Transaction;
import com.facturation.paiement.repository.interfaces.TransactionRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepositoryInterface transactionRepository;
    private final TransactionMapper transactionMapper;
    private final RemiseService remiseService;

    /**
     * Enregistre une nouvelle transaction de remise.
     * Lève RemiseException si montantApres <= 0.
     */
    @Transactional
    public TransactionResponseDTO save(TransactionRequestDTO dto) {
        if (dto.getMontantApres() != null && dto.getMontantApres() <= 0) {
            throw new RemiseException("Le montant après remise doit être supérieur à 0. Valeur reçue : " + dto.getMontantApres());
        }
        if (dto.getMontantAvant() != null && dto.getMontantAvant() <= 0) {
            throw new RemiseException("Le montant avant remise doit être supérieur à 0. Valeur reçue : " + dto.getMontantAvant());
        }

        Remise remise = remiseService.getEntityById(dto.getRemiseId());
        Transaction transaction = transactionMapper.toEntity(dto);
        transaction.setRemise(remise);
        return transactionMapper.toDto(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public TransactionResponseDTO findById(Long id) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction introuvable avec l'ID : " + id));
        return transactionMapper.toDto(t);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> findAll() {
        return transactionRepository.findAll().stream()
                .map(transactionMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> findByRemiseId(Long remiseId) {
        return transactionRepository.findByRemiseId(remiseId).stream()
                .map(transactionMapper::toDto).collect(Collectors.toList());
    }

    /**
     * Met à jour une transaction existante.
     * Lève RemiseException si montantApres <= 0.
     */
    @Transactional
    public TransactionResponseDTO update(Long id, TransactionRequestDTO dto) {
        if (dto.getMontantApres() != null && dto.getMontantApres() <= 0) {
            throw new RemiseException("Le montant après remise doit être supérieur à 0. Valeur reçue : " + dto.getMontantApres());
        }
        if (dto.getMontantAvant() != null && dto.getMontantAvant() <= 0) {
            throw new RemiseException("Le montant avant remise doit être supérieur à 0. Valeur reçue : " + dto.getMontantAvant());
        }

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction introuvable avec l'ID : " + id));

        if (dto.getRemiseId() != null && !dto.getRemiseId().equals(transaction.getRemise().getId())) {
            Remise remise = remiseService.getEntityById(dto.getRemiseId());
            transaction.setRemise(remise);
        }
        transactionMapper.updateFromDto(dto, transaction);
        return transactionMapper.toDto(transactionRepository.save(transaction));
    }

    /**
     * Supprime une transaction par son ID.
     */
    @Transactional
    public void deleteById(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction introuvable avec l'ID : " + id);
        }
        transactionRepository.deleteById(id);
    }
}

package com.facturation.paiement.services;

import com.facturation.paiement.dto.TransactionRequestDTO;
import com.facturation.paiement.dto.TransactionResponseDTO;
import com.facturation.paiement.exceptions.RemiseException;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.TransactionMapper;
import com.facturation.paiement.models.Remise;
import com.facturation.paiement.models.Transaction;
import com.facturation.paiement.repository.interfaces.TransactionRepositoryInterface;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests Unitaires - TransactionService")
class TransactionServiceTest {

    @Mock private TransactionRepositoryInterface transactionRepository;
    @Mock private TransactionMapper transactionMapper;
    @Mock private RemiseService remiseService;

    @InjectMocks private TransactionService transactionService;

    private Remise remise;
    private Transaction transaction;
    private TransactionRequestDTO requestDTO;
    private TransactionResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        remise = Remise.builder().id(1L).valeur(10.0).build();

        transaction = Transaction.builder()
                .id(1L)
                .date(LocalDateTime.now())
                .montantAvant(500.0)
                .montantRemise(50.0)
                .montantApres(450.0)
                .remise(remise)
                .build();

        requestDTO = TransactionRequestDTO.builder()
                .date(LocalDateTime.now())
                .montantAvant(500.0)
                .montantRemise(50.0)
                .montantApres(450.0)
                .remiseId(1L)
                .build();

        responseDTO = TransactionResponseDTO.builder()
                .id(1L)
                .montantAvant(500.0)
                .montantRemise(50.0)
                .montantApres(450.0)
                .remiseId(1L)
                .build();
    }

    @Test
    @DisplayName("save() - Cas nominal : transaction enregistrée avec succès")
    void save_nominalCase_shouldReturnTransactionResponseDTO() {
        when(remiseService.getEntityById(1L)).thenReturn(remise);
        when(transactionMapper.toEntity(any())).thenReturn(transaction);
        when(transactionRepository.save(any())).thenReturn(transaction);
        when(transactionMapper.toDto(any())).thenReturn(responseDTO);

        TransactionResponseDTO result = transactionService.save(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.getMontantRemise()).isEqualTo(50.0);
        verify(transactionRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("findById() - Cas nominal")
    void findById_nominalCase_shouldReturnTransaction() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
        when(transactionMapper.toDto(any())).thenReturn(responseDTO);

        TransactionResponseDTO result = transactionService.findById(1L);

        assertThat(result.getMontantApres()).isEqualTo(450.0);
    }
}

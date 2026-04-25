package com.facturation.paiement.services;

import com.facturation.paiement.dto.RemiseRequestDTO;
import com.facturation.paiement.dto.RemiseResponseDTO;
import com.facturation.paiement.enums.StatutFacture;
import com.facturation.paiement.enums.TypeRemise;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.RemiseMapper;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.Remise;
import com.facturation.paiement.models.Transaction;
import com.facturation.paiement.repository.interfaces.RemiseRepositoryInterface;
import com.facturation.paiement.repository.interfaces.TransactionRepositoryInterface;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests Unitaires - RemiseService (Modèle Excellence)")
class RemiseServiceTest {

    @Mock private RemiseRepositoryInterface remiseRepository;
    @Mock private TransactionRepositoryInterface transactionRepository;
    @Mock private FactureService factureService;
    @Mock private RemiseMapper remiseMapper;

    @InjectMocks private RemiseService remiseService;

    private Facture facture;
    private Remise remise;
    private RemiseRequestDTO requestDTO;
    private RemiseResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        facture = Facture.builder().id(1L).montantBrut(1000.0).montantNet(1000.0).statut(StatutFacture.IMPAYE).build();
        remise = Remise.builder().id(1L).valeur(100.0).typeRemise(TypeRemise.FIXE).estAutorisee(false).facture(facture).build();
        requestDTO = RemiseRequestDTO.builder().factureId(1L).valeur(100.0).typeRemise(TypeRemise.FIXE).estAutorisee(false).build();
        responseDTO = RemiseResponseDTO.builder().id(1L).build();
    }

    @Test
    @DisplayName("create() - Cas nominal : traçage transaction avec montantNet correct")
    void create_nominalCase_shouldTraceTransactionWithCorrectNet() {
        when(factureService.getEntityById(1L)).thenReturn(facture);
        when(remiseMapper.toEntity(any())).thenReturn(remise);
        when(remiseRepository.save(any())).thenReturn(remise);
        when(remiseMapper.toDto(any())).thenReturn(responseDTO);

        remiseService.create(requestDTO);

        verify(transactionRepository).save(argThat(t -> 
            t.getMontantAvant().equals(1000.0) && t.getMontantApres().equals(1000.0) // Non autorisée -> pas de changement
        ));
        verify(factureService).recalculateFinancialsAndStatus(1L);
    }

    @Test
    @DisplayName("update() - Activation de la remise : le net doit changer dans la transaction")
    void update_whenAuthorizedTrue_shouldTraceNetChange() {
        when(remiseRepository.findById(1L)).thenReturn(Optional.of(remise));
        remise.setEstAutorisee(true); // Simulons l'activation
        when(remiseRepository.save(any())).thenReturn(remise);
        when(remiseMapper.toDto(any())).thenReturn(responseDTO);

        remiseService.update(1L, requestDTO);

        verify(transactionRepository).save(argThat(t -> 
            t.getMontantAvant().equals(1000.0) && t.getMontantApres().equals(900.0) // Autorisée -> net diminue
        ));
    }
}

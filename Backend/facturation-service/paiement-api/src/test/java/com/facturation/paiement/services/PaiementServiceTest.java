package com.facturation.paiement.services;

import com.facturation.paiement.dto.PaiementRequestDTO;
import com.facturation.paiement.dto.PaiementResponseDTO;
import com.facturation.paiement.enums.ModePaiement;
import com.facturation.paiement.enums.StatutFacture;
import com.facturation.paiement.exceptions.IllegalInvoiceStateException;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.PaiementMapper;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.Paiement;
import com.facturation.paiement.repository.interfaces.PaiementRepositoryInterface;
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
@DisplayName("Tests Unitaires - PaiementService")
class PaiementServiceTest {

    @Mock private PaiementRepositoryInterface paiementRepository;
    @Mock private FactureService factureService;
    @Mock private PaiementMapper paiementMapper;

    @InjectMocks private PaiementService paiementService;

    private Facture factureImpayee;
    private Facture facturePayee;
    private Paiement paiement;
    private PaiementRequestDTO requestDTO;
    private PaiementResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        factureImpayee = Facture.builder().id(1L).montantBrut(500.0).montantNet(500.0).statut(StatutFacture.IMPAYE).build();
        facturePayee = Facture.builder().id(2L).montantBrut(500.0).montantNet(500.0).statut(StatutFacture.PAYEE).build();

        paiement = Paiement.builder()
                .id(1L).datePaiement(LocalDate.now()).montant(200.0)
                .modePaiement(ModePaiement.ESPECES)
                .facture(factureImpayee).build();

        requestDTO = PaiementRequestDTO.builder()
                .datePaiement(LocalDate.now()).montant(200.0)
                .modePaiement(ModePaiement.ESPECES)
                .factureId(1L).build();

        responseDTO = PaiementResponseDTO.builder()
                .id(1L).montant(200.0).factureId(1L).build();
    }

    @Test
    @DisplayName("create() - Cas nominal")
    void create_nominalCase() {
        when(factureService.getEntityById(1L)).thenReturn(factureImpayee);
        when(factureService.calculateCurrentResteAPayer(1L)).thenReturn(500.0);
        when(paiementMapper.toEntity(any())).thenReturn(paiement);
        when(paiementRepository.save(any())).thenReturn(paiement);
        when(paiementMapper.toDto(any())).thenReturn(responseDTO);

        PaiementResponseDTO result = paiementService.create(requestDTO);
        assertThat(result.getMontant()).isEqualTo(200.0);
        verify(factureService).recalculateFinancialsAndStatus(1L);
    }

    @Test
    @DisplayName("create() - Exception : Dépassement de paiement")
    void create_whenOverpaid_shouldThrowIllegalInvoiceStateException() {
        when(factureService.getEntityById(1L)).thenReturn(factureImpayee);
        when(factureService.calculateCurrentResteAPayer(1L)).thenReturn(100.0);
        requestDTO.setMontant(150.0);

        assertThatThrownBy(() -> paiementService.create(requestDTO))
                .isInstanceOf(IllegalInvoiceStateException.class)
                .hasMessageContaining("dépasse le reste à payer");
    }

    @Test
    @DisplayName("create() - Exception : Facture déjà PAYÉE")
    void create_whenFacturePayee_shouldThrowIllegalInvoiceStateException() {
        when(factureService.getEntityById(2L)).thenReturn(facturePayee);
        requestDTO.setFactureId(2L);

        assertThatThrownBy(() -> paiementService.create(requestDTO))
                .isInstanceOf(IllegalInvoiceStateException.class)
                .hasMessageContaining("déjà PAYÉE");
    }

    @Test
    @DisplayName("delete() - Cas nominal")
    void delete_nominalCase() {
        when(paiementRepository.findById(1L)).thenReturn(Optional.of(paiement));
        doNothing().when(paiementRepository).deleteById(1L);

        assertThatNoException().isThrownBy(() -> paiementService.delete(1L));
        verify(factureService).recalculateFinancialsAndStatus(1L);
    }
}

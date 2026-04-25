package com.facturation.paiement.services;

import com.facturation.paiement.dto.LigneFactureRequestDTO;
import com.facturation.paiement.dto.LigneFactureResponseDTO;
import com.facturation.paiement.enums.StatutFacture;
import com.facturation.paiement.exceptions.IllegalInvoiceStateException;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.LigneFactureMapper;
import com.facturation.paiement.models.ActeMedical;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.LigneFacture;
import com.facturation.paiement.repository.interfaces.LigneFactureRepositoryInterface;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests Unitaires - LigneFactureService")
class LigneFactureServiceTest {

    @Mock private LigneFactureRepositoryInterface ligneFactureRepository;
    @Mock private FactureService factureService;
    @Mock private ActeMedicalService acteMedicalService;
    @Mock private LigneFactureMapper ligneFactureMapper;

    @InjectMocks private LigneFactureService ligneFactureService;

    private Facture factureImpayee;
    private Facture facturePayee;
    private ActeMedical acte;
    private LigneFacture ligne;
    private LigneFactureRequestDTO requestDTO;
    private LigneFactureResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        factureImpayee = Facture.builder().id(1L).statut(StatutFacture.IMPAYE).build();
        facturePayee = Facture.builder().id(2L).statut(StatutFacture.PAYEE).build();
        acte = ActeMedical.builder().id(1L).libelle("Consultation").prix(150.0).build();
        ligne = LigneFacture.builder().id(1L).facture(factureImpayee).acteMedical(acte).quantite(2).prixUnitaire(150.0).sousTotal(300.0).build();
        requestDTO = LigneFactureRequestDTO.builder().factureId(1L).acteMedicalId(1L).quantite(2).build();
        responseDTO = LigneFactureResponseDTO.builder().id(1L).sousTotal(300.0).build();
    }

    @Test
    @DisplayName("create() - Cas nominal : prix copié et sous-total calculé")
    void create_nominalCase_shouldCopyPriceAndCalculateTotal() {
        when(factureService.getEntityById(1L)).thenReturn(factureImpayee);
        when(acteMedicalService.getEntityById(1L)).thenReturn(acte);
        when(ligneFactureMapper.toEntity(any())).thenReturn(new LigneFacture());
        when(ligneFactureRepository.save(any())).thenReturn(ligne);
        when(ligneFactureMapper.toDto(any())).thenReturn(responseDTO);

        LigneFactureResponseDTO result = ligneFactureService.create(requestDTO);

        assertThat(result).isNotNull();
        verify(factureService).recalculateFinancialsAndStatus(1L);
    }

    @Test
    @DisplayName("create() - Exception : Facture non IMPAYEE")
    void create_whenFactureNotImpayee_shouldThrowException() {
        when(factureService.getEntityById(2L)).thenReturn(facturePayee);
        requestDTO.setFactureId(2L);

        assertThatThrownBy(() -> ligneFactureService.create(requestDTO))
                .isInstanceOf(IllegalInvoiceStateException.class)
                .hasMessageContaining("n'est plus en état IMPAYÉE");
    }

    @Test
    @DisplayName("update() - Cas nominal")
    void update_nominalCase() {
        when(ligneFactureRepository.findById(1L)).thenReturn(Optional.of(ligne));
        when(ligneFactureRepository.save(any())).thenReturn(ligne);
        when(ligneFactureMapper.toDto(any())).thenReturn(responseDTO);

        LigneFactureResponseDTO result = ligneFactureService.update(1L, requestDTO);

        assertThat(result).isNotNull();
        verify(factureService).recalculateFinancialsAndStatus(1L);
    }

    @Test
    @DisplayName("delete() - Cas nominal")
    void delete_nominalCase() {
        when(ligneFactureRepository.findById(1L)).thenReturn(Optional.of(ligne));
        doNothing().when(ligneFactureRepository).deleteById(1L);

        assertThatNoException().isThrownBy(() -> ligneFactureService.delete(1L));
        verify(factureService).recalculateFinancialsAndStatus(1L);
    }
}

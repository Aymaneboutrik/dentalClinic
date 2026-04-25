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
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.LigneFacture;
import com.facturation.paiement.models.Paiement;
import com.facturation.paiement.models.Remise;
import com.facturation.paiement.repository.interfaces.FactureRepositoryInterface;
import com.facturation.paiement.repository.interfaces.LigneFactureRepositoryInterface;
import com.facturation.paiement.repository.interfaces.PaiementRepositoryInterface;
import com.facturation.paiement.repository.interfaces.RemiseRepositoryInterface;
import com.facturation.paiement.notifications.NotificationService;
import com.facturation.paiement.enums.ModePaiement;
import com.facturation.paiement.enums.StatutFacture;
import com.facturation.paiement.enums.TypeRemise;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests Unitaires - FactureService (Modèle Excellence)")
class FactureServiceTest {

    @Mock private FactureRepositoryInterface factureRepository;
    @Mock private LigneFactureRepositoryInterface ligneFactureRepository;
    @Mock private PaiementRepositoryInterface paiementRepository;
    @Mock private RemiseRepositoryInterface remiseRepository;
    @Mock private FactureMapper factureMapper;
    @Mock private LigneFactureMapper ligneFactureMapper;
    @Mock private PaiementMapper paiementMapper;
    @Mock private RemiseMapper remiseMapper;
    @Mock private NotificationService notificationService;

    @InjectMocks private FactureService factureService;

    private Facture facture;
    private FactureRequestDTO requestDTO;
    private FactureResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        facture = Facture.builder()
                .id(1L).montantBrut(0.0).montantNet(0.0).date(LocalDate.now()).statut(StatutFacture.IMPAYE)
                .lignesFacture(new ArrayList<>()).build();
        requestDTO = FactureRequestDTO.builder().date(LocalDate.now()).build();
        responseDTO = FactureResponseDTO.builder().id(1L).montantBrut(0.0).montantNet(0.0).build();
    }

    @Test
    @DisplayName("recalculateFinancialsAndStatus() - Remise NON autorisée ignorée")
    void recalculate_whenRemiseNotAuthorized_shouldNotChangeNet() {
        facture.getLignesFacture().add(LigneFacture.builder().sousTotal(1000.0).build());
        Remise r = Remise.builder().valeur(10.0).typeRemise(TypeRemise.VARIABLE).estAutorisee(false).build();

        when(factureRepository.findById(1L)).thenReturn(Optional.of(facture));
        when(remiseRepository.findByFactureId(1L)).thenReturn(List.of(r));
        when(paiementRepository.findByFactureId(1L)).thenReturn(new ArrayList<>());
        when(factureRepository.save(any())).thenReturn(facture);

        factureService.recalculateFinancialsAndStatus(1L);

        assertThat(facture.getMontantBrut()).isEqualTo(1000.0);
        assertThat(facture.getMontantNet()).isEqualTo(1000.0); // Pas de changement car non autorisée
    }

    @Test
    @DisplayName("recalculateFinancialsAndStatus() - Remise autorisée appliquée")
    void recalculate_whenRemiseAuthorized_shouldUpdateNet() {
        facture.getLignesFacture().add(LigneFacture.builder().sousTotal(1000.0).build());
        Remise r = Remise.builder().valeur(100.0).typeRemise(TypeRemise.FIXE).estAutorisee(true).build();

        when(factureRepository.findById(1L)).thenReturn(Optional.of(facture));
        when(remiseRepository.findByFactureId(1L)).thenReturn(List.of(r));
        when(paiementRepository.findByFactureId(1L)).thenReturn(new ArrayList<>());
        when(factureRepository.save(any())).thenReturn(facture);

        factureService.recalculateFinancialsAndStatus(1L);

        assertThat(facture.getMontantBrut()).isEqualTo(1000.0);
        assertThat(facture.getMontantNet()).isEqualTo(900.0); 
    }

    @Test
    @DisplayName("recalculateFinancialsAndStatus() - Remise supérieure au brut plafonnée à zéro")
    void recalculate_whenRemiseExceedsBrut_shouldCapNetAtZero() {
        facture.getLignesFacture().add(LigneFacture.builder().sousTotal(100.0).build());
        Remise r = Remise.builder().valeur(150.0).typeRemise(TypeRemise.FIXE).estAutorisee(true).build();

        when(factureRepository.findById(1L)).thenReturn(Optional.of(facture));
        when(remiseRepository.findByFactureId(1L)).thenReturn(List.of(r));
        when(paiementRepository.findByFactureId(1L)).thenReturn(new ArrayList<>());
        when(factureRepository.save(any())).thenReturn(facture);

        factureService.recalculateFinancialsAndStatus(1L);

        assertThat(facture.getMontantBrut()).isEqualTo(100.0);
        assertThat(facture.getMontantNet()).isEqualTo(0.0); // Plafond atteint
    }

    @Test
    @DisplayName("getFicheFacture() - Cas nominal : fiche complète retournée")
    void getFicheFacture_nominalCase_shouldReturnCompleteFiche() {
        // Préparer une facture avec une ligne, une remise autorisée, et un paiement
        LigneFacture ligne = LigneFacture.builder()
                .id(1L).sousTotal(500.0).quantite(1).prixUnitaire(500.0).build();
        Remise remise = Remise.builder()
                .id(1L).valeur(10.0).typeRemise(TypeRemise.VARIABLE).estAutorisee(true).build();
        Paiement paiement = Paiement.builder()
                .id(1L).montant(200.0).modePaiement(ModePaiement.ESPECES).build();

        Facture factureComplete = Facture.builder()
                .id(1L)
                .montantBrut(500.0)
                .montantNet(450.0)
                .date(LocalDate.now())
                .statut(StatutFacture.PARTIEL)
                .lignesFacture(List.of(ligne))
                .remises(List.of(remise))
                .paiements(List.of(paiement))
                .build();

        LigneFactureResponseDTO ligneDTO = LigneFactureResponseDTO.builder().id(1L).sousTotal(500.0).build();
        RemiseResponseDTO remiseDTO = RemiseResponseDTO.builder().id(1L).valeur(10.0).typeRemise(TypeRemise.VARIABLE).estAutorisee(true).build();
        PaiementResponseDTO paiementDTO = PaiementResponseDTO.builder().id(1L).montant(200.0).build();

        when(factureRepository.findById(1L)).thenReturn(Optional.of(factureComplete));
        when(ligneFactureMapper.toDto(ligne)).thenReturn(ligneDTO);
        when(remiseMapper.toDto(remise)).thenReturn(remiseDTO);
        when(paiementMapper.toDto(paiement)).thenReturn(paiementDTO);

        FicheFactureDTO fiche = factureService.getFicheFacture(1L);

        // Vérifications de la structure
        assertThat(fiche.getId()).isEqualTo(1L);
        assertThat(fiche.getStatut()).isEqualTo(StatutFacture.PARTIEL);
        assertThat(fiche.getMontantBrut()).isEqualTo(500.0);
        assertThat(fiche.getMontantNet()).isEqualTo(450.0);

        // Vérifications des listes
        assertThat(fiche.getLignesFacture()).hasSize(1);
        assertThat(fiche.getRemises()).hasSize(1);
        assertThat(fiche.getPaiements()).hasSize(1);

        // Vérification du récapitulatif financier
        assertThat(fiche.getTotalPaye()).isEqualTo(200.0);
        assertThat(fiche.getResteAPayer()).isEqualTo(250.0); // 450 - 200
    }
}

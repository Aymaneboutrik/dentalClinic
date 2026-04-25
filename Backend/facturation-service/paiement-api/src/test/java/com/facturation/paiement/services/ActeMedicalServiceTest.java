package com.facturation.paiement.services;

import com.facturation.paiement.dto.ActeMedicalRequestDTO;
import com.facturation.paiement.dto.ActeMedicalResponseDTO;
import com.facturation.paiement.enums.TypeActe;
import com.facturation.paiement.exceptions.ResourceNotFoundException;
import com.facturation.paiement.mappers.ActeMedicalMapper;
import com.facturation.paiement.models.ActeMedical;
import com.facturation.paiement.repository.interfaces.ActeMedicalRepositoryInterface;
import com.facturation.paiement.repository.interfaces.FactureRepositoryInterface;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.LigneFacture;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests Unitaires - ActeMedicalService")
class ActeMedicalServiceTest {

    @Mock private ActeMedicalRepositoryInterface acteMedicalRepository;
    @Mock private FactureRepositoryInterface factureRepository;
    @Mock private ActeMedicalMapper acteMedicalMapper;

    @InjectMocks private ActeMedicalService acteMedicalService;

    private ActeMedical acte;
    private ActeMedicalRequestDTO requestDTO;
    private ActeMedicalResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        acte = ActeMedical.builder().id(1L).libelle("Consultation").prix(150.0).typeActe(TypeActe.CONSULTATION).build();
        requestDTO = ActeMedicalRequestDTO.builder().libelle("Consultation").prix(150.0).typeActe(TypeActe.CONSULTATION).build();
        responseDTO = ActeMedicalResponseDTO.builder().id(1L).libelle("Consultation").prix(150.0).typeActe(TypeActe.CONSULTATION).build();
    }

    @Test
    @DisplayName("create() - Cas nominal : catalogue indépendant")
    void create_nominalCase_shouldReturnDTO() {
        when(acteMedicalMapper.toEntity(any())).thenReturn(acte);
        when(acteMedicalRepository.save(any())).thenReturn(acte);
        when(acteMedicalMapper.toDto(any())).thenReturn(responseDTO);

        ActeMedicalResponseDTO result = acteMedicalService.create(requestDTO);
        assertThat(result.getLibelle()).isEqualTo("Consultation");
        verify(acteMedicalRepository).save(any());
    }

    @Test
    @DisplayName("findById() - Cas nominal")
    void findById_nominalCase() {
        when(acteMedicalRepository.findById(1L)).thenReturn(Optional.of(acte));
        when(acteMedicalMapper.toDto(any())).thenReturn(responseDTO);

        ActeMedicalResponseDTO result = acteMedicalService.findById(1L);
        assertThat(result.getPrix()).isEqualTo(150.0);
    }

    @Test
    @DisplayName("findAll() - Cas nominal")
    void findAll_shouldReturnList() {
        when(acteMedicalRepository.findAll()).thenReturn(List.of(acte));
        when(acteMedicalMapper.toDto(any())).thenReturn(responseDTO);

        List<ActeMedicalResponseDTO> results = acteMedicalService.findAll();
        assertThat(results).hasSize(1);
    }

    @Test
    @DisplayName("delete() - Cas nominal")
    void delete_nominalCase() {
        when(acteMedicalRepository.existsById(1L)).thenReturn(true);
        doNothing().when(acteMedicalRepository).deleteById(1L);
        assertThatNoException().isThrownBy(() -> acteMedicalService.delete(1L));
        verify(acteMedicalRepository).deleteById(1L);
    }

    @Test
    @DisplayName("findByFactureId() - Cas nominal")
    void findByFactureId_shouldReturnList() {
        Facture f = Facture.builder().id(10L).lignesFacture(List.of(
            LigneFacture.builder().acteMedical(acte).build()
        )).build();
        when(factureRepository.findById(10L)).thenReturn(Optional.of(f));
        when(acteMedicalMapper.toDto(any())).thenReturn(responseDTO);

        List<ActeMedicalResponseDTO> results = acteMedicalService.findByFactureId(10L);
        assertThat(results).hasSize(1);
    }
}

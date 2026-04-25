package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.LigneFactureRequestDTO;
import com.facturation.paiement.dto.LigneFactureResponseDTO;
import com.facturation.paiement.models.ActeMedical;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.LigneFacture;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Tests unitaires - LigneFactureMapper")
class LigneFactureMapperTest {

    private final LigneFactureMapper mapper = Mappers.getMapper(LigneFactureMapper.class);

    @Test
    void toEntity_shouldMapBasicFields() {
        LigneFactureRequestDTO dto = LigneFactureRequestDTO.builder()
                .factureId(1L)
                .acteMedicalId(2L)
                .quantite(5)
                .build();

        LigneFacture entity = mapper.toEntity(dto);

        assertThat(entity.getQuantite()).isEqualTo(5);
        // Relationship fields (facture, acteMedical) are usually handled in the service via IDs
    }

    @Test
    void toDto_shouldMapIdsAndDetails() {
        Facture f = Facture.builder().id(10L).build();
        ActeMedical a = ActeMedical.builder().id(20L).libelle("Soin").build();
        LigneFacture entity = LigneFacture.builder()
                .id(1L).facture(f).acteMedical(a).quantite(3).prixUnitaire(100.0).sousTotal(300.0).build();

        LigneFactureResponseDTO dto = mapper.toDto(entity);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getFactureId()).isEqualTo(10L);
        assertThat(dto.getActeMedicalId()).isEqualTo(20L);
        assertThat(dto.getLibelleActe()).isEqualTo("Soin");
        assertThat(dto.getSousTotal()).isEqualTo(300.0);
    }
}

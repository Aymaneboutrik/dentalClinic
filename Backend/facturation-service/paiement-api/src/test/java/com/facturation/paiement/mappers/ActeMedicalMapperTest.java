package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.ActeMedicalRequestDTO;
import com.facturation.paiement.dto.ActeMedicalResponseDTO;
import com.facturation.paiement.enums.TypeActe;
import com.facturation.paiement.models.ActeMedical;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Tests unitaires - ActeMedicalMapper")
class ActeMedicalMapperTest {

    private final ActeMedicalMapper mapper = Mappers.getMapper(ActeMedicalMapper.class);

    @Test
    void toEntity_shouldMapBasicFields() {
        ActeMedicalRequestDTO dto = ActeMedicalRequestDTO.builder()
                .libelle("Scanner")
                .prix(420.0)
                .typeActe(TypeActe.SOIN)
                .build();

        ActeMedical entity = mapper.toEntity(dto);

        assertThat(entity.getLibelle()).isEqualTo("Scanner");
        assertThat(entity.getPrix()).isEqualTo(420.0);
        assertThat(entity.getTypeActe()).isEqualTo(TypeActe.SOIN);
    }

    @Test
    void toDto_shouldMapBasicFields() {
        ActeMedical entity = ActeMedical.builder().id(3L).libelle("Echo").prix(300.0).typeActe(TypeActe.CONSULTATION).build();

        ActeMedicalResponseDTO dto = mapper.toDto(entity);

        assertThat(dto.getId()).isEqualTo(3L);
        assertThat(dto.getTypeActe()).isEqualTo(TypeActe.CONSULTATION);
    }

    @Test
    void updateFromDto_shouldIgnoreNulls() {
        ActeMedical entity = ActeMedical.builder().id(1L).libelle("Ancien").prix(100.0).typeActe(TypeActe.CONSULTATION).build();
        ActeMedicalRequestDTO dto = ActeMedicalRequestDTO.builder().libelle("Nouveau").prix(null).typeActe(TypeActe.ANALYSE).build();

        mapper.updateFromDto(dto, entity);

        assertThat(entity.getLibelle()).isEqualTo("Nouveau");
        assertThat(entity.getPrix()).isEqualTo(100.0);
        assertThat(entity.getTypeActe()).isEqualTo(TypeActe.ANALYSE);
    }
}

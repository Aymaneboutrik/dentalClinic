package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.RemiseRequestDTO;
import com.facturation.paiement.dto.RemiseResponseDTO;
import com.facturation.paiement.enums.TypeRemise;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.Remise;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Tests unitaires - RemiseMapper")
class RemiseMapperTest {

    private final RemiseMapper mapper = Mappers.getMapper(RemiseMapper.class);

    @Test
    void toEntity_shouldIncludeNewFields() {
        RemiseRequestDTO dto = RemiseRequestDTO.builder()
                .valeur(20.0)
                .dateRemise(LocalDate.now())
                .typeRemise(TypeRemise.VARIABLE)
                .factureId(1L)
                .estAutorisee(true)
                .build();

        Remise entity = mapper.toEntity(dto);

        assertThat(entity.getValeur()).isEqualTo(20.0);
        assertThat(entity.getEstAutorisee()).isTrue();
    }

    @Test
    void toDto_shouldIncludeNewFields() {
        Remise entity = Remise.builder()
                .id(4L)
                .valeur(15.0)
                .estAutorisee(true)
                .facture(Facture.builder().id(13L).build())
                .build();

        RemiseResponseDTO dto = mapper.toDto(entity);

        assertThat(dto.getEstAutorisee()).isTrue();
        assertThat(dto.getFactureId()).isEqualTo(13L);
    }
}

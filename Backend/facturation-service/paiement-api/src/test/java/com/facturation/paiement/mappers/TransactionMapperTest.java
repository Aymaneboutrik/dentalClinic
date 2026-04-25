package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.TransactionRequestDTO;
import com.facturation.paiement.dto.TransactionResponseDTO;
import com.facturation.paiement.models.Remise;
import com.facturation.paiement.models.Transaction;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Tests unitaires - TransactionMapper")
class TransactionMapperTest {

    private final TransactionMapper mapper = Mappers.getMapper(TransactionMapper.class);

    @Test
    void toEntity_shouldIncludeMontantRemise() {
        TransactionRequestDTO dto = TransactionRequestDTO.builder()
                .date(LocalDateTime.now())
                .montantAvant(500.0)
                .montantApres(450.0)
                .montantRemise(50.0)
                .remiseId(6L)
                .build();

        Transaction entity = mapper.toEntity(dto);

        assertThat(entity.getMontantAvant()).isEqualTo(500.0);
        assertThat(entity.getMontantApres()).isEqualTo(450.0);
        assertThat(entity.getMontantRemise()).isEqualTo(50.0);
    }

    @Test
    void toDto_shouldIncludeMontantRemise() {
        Transaction entity = Transaction.builder()
                .id(2L)
                .date(LocalDateTime.now())
                .montantAvant(500.0)
                .montantApres(400.0)
                .montantRemise(100.0)
                .remise(Remise.builder().id(99L).build())
                .build();

        TransactionResponseDTO dto = mapper.toDto(entity);

        assertThat(dto.getMontantRemise()).isEqualTo(100.0);
        assertThat(dto.getRemiseId()).isEqualTo(99L);
    }
}

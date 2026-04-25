package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.PaiementRequestDTO;
import com.facturation.paiement.dto.PaiementResponseDTO;
import com.facturation.paiement.enums.ModePaiement;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.Paiement;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Tests unitaires - PaiementMapper")
class PaiementMapperTest {

    private final PaiementMapper mapper = Mappers.getMapper(PaiementMapper.class);

    @Test
    void toEntity_shouldMapFieldsAndIgnoreFacture() {
        PaiementRequestDTO dto = PaiementRequestDTO.builder()
                .datePaiement(LocalDate.now())
                .montant(250.0)
                .modePaiement(ModePaiement.CHEQUE)
                .factureId(11L)
                .build();

        Paiement entity = mapper.toEntity(dto);

        assertThat(entity.getMontant()).isEqualTo(250.0);
        assertThat(entity.getModePaiement()).isEqualTo(ModePaiement.CHEQUE);
        assertThat(entity.getFacture()).isNull();
    }

    @Test
    void toDto_shouldMapFactureId() {
        Facture facture = Facture.builder().id(5L).build();
        Paiement entity = Paiement.builder()
                .id(1L)
                .datePaiement(LocalDate.now())
                .montant(99.0)
                .modePaiement(ModePaiement.ESPECES)
                .facture(facture)
                .build();

        PaiementResponseDTO dto = mapper.toDto(entity);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getFactureId()).isEqualTo(5L);
    }

    @Test
    void updateFromDto_shouldIgnoreNullsAndFacture() {
        Facture facture = Facture.builder().id(8L).build();
        Paiement entity = Paiement.builder()
                .id(1L)
                .montant(100.0)
                .modePaiement(ModePaiement.CARTE_BANCAIRE)
                .facture(facture)
                .build();
        PaiementRequestDTO dto = PaiementRequestDTO.builder()
                .datePaiement(LocalDate.now())
                .montant(null)
                .modePaiement(ModePaiement.ASSURANCE)
                .factureId(999L)
                .build();

        mapper.updateFromDto(dto, entity);

        assertThat(entity.getDatePaiement()).isEqualTo(dto.getDatePaiement());
        assertThat(entity.getMontant()).isEqualTo(100.0);
        assertThat(entity.getModePaiement()).isEqualTo(ModePaiement.ASSURANCE);
        assertThat(entity.getFacture().getId()).isEqualTo(8L);
    }
}

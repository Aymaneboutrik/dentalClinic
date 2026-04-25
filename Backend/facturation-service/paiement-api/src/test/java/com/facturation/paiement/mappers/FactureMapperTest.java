package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.FactureRequestDTO;
import com.facturation.paiement.dto.FactureResponseDTO;
import com.facturation.paiement.enums.ModePaiement;
import com.facturation.paiement.enums.StatutFacture;
import com.facturation.paiement.enums.TypeRemise;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.Paiement;
import com.facturation.paiement.models.Remise;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import com.facturation.paiement.models.LigneFacture;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Tests unitaires - FactureMapper")
class FactureMapperTest {

    private FactureMapper mapper;

    @BeforeEach
    void setUp() {
        // Obtenir l'instance du mapper principal via la factory MapStruct
        this.mapper = Mappers.getMapper(FactureMapper.class);
        
        // Obtenir les instances des mappers dépendants
        LigneFactureMapper ligneMapper = Mappers.getMapper(LigneFactureMapper.class);
        PaiementMapper pMapper = Mappers.getMapper(PaiementMapper.class);

        // Injecter manuellement les dépendances via réflexion pour éviter de citer les classes "Impl" générées
        // (MapStruct génère des champs privés portant le nom de la classe du mapper en camelCase)
        org.springframework.test.util.ReflectionTestUtils.setField(this.mapper, "ligneFactureMapper", ligneMapper);
        org.springframework.test.util.ReflectionTestUtils.setField(this.mapper, "paiementMapper", pMapper);
    }

    @Test
    void toDto_shouldMapGrossAndNet() {
        Facture facture = Facture.builder()
                .id(1L)
                .date(LocalDate.now())
                .statut(StatutFacture.PARTIEL)
                .lignesFacture(List.of(LigneFacture.builder().sousTotal(1000.0).build()))
                .remises(List.of(Remise.builder().valeur(100.0).typeRemise(TypeRemise.FIXE).estAutorisee(true).build()))
                .paiements(List.of(Paiement.builder().montant(300.0).modePaiement(ModePaiement.ESPECES).build()))
                .build();

        FactureResponseDTO dto = mapper.toDto(facture);

        assertThat(dto.getMontantBrut()).isEqualTo(1000.0);
        assertThat(dto.getMontantNet()).isEqualTo(900.0);
        assertThat(dto.getTotalPaye()).isEqualTo(300.0);
        assertThat(dto.getResteAPayer()).isEqualTo(600.0);
    }

    @Test
    void toEntity_shouldMapSimpleFields() {
        FactureRequestDTO dto = FactureRequestDTO.builder()
                .date(LocalDate.now())
                .build();

        Facture entity = mapper.toEntity(dto);
        assertThat(entity.getDate()).isEqualTo(dto.getDate());
    }
}

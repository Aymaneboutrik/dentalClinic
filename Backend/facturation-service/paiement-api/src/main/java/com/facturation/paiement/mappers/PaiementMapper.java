package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.PaiementRequestDTO;
import com.facturation.paiement.dto.PaiementResponseDTO;
import com.facturation.paiement.models.Paiement;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PaiementMapper {
    @Mapping(target = "facture", ignore = true)
    Paiement toEntity(PaiementRequestDTO dto);

    @Mapping(target = "factureId", source = "facture.id")
    PaiementResponseDTO toDto(Paiement paiement);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "facture", ignore = true)
    void updateFromDto(PaiementRequestDTO dto, @MappingTarget Paiement paiement);
}

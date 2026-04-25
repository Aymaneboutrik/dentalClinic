package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.RemiseRequestDTO;
import com.facturation.paiement.dto.RemiseResponseDTO;
import com.facturation.paiement.models.Remise;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface RemiseMapper {
    @Mapping(target = "facture", ignore = true)
    @Mapping(target = "transactions", ignore = true)
    Remise toEntity(RemiseRequestDTO dto);

    @Mapping(target = "factureId", source = "facture.id")
    @Mapping(target = "montantCalcule", ignore = true)
    RemiseResponseDTO toDto(Remise remise);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "facture", ignore = true)
    @Mapping(target = "transactions", ignore = true)
    void updateFromDto(RemiseRequestDTO dto, @MappingTarget Remise remise);
}

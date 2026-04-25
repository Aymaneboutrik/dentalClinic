package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.TransactionRequestDTO;
import com.facturation.paiement.dto.TransactionResponseDTO;
import com.facturation.paiement.models.Transaction;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    @Mapping(target = "remise", ignore = true)
    Transaction toEntity(TransactionRequestDTO dto);

    @Mapping(target = "remiseId", source = "remise.id")
    TransactionResponseDTO toDto(Transaction transaction);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "remise", ignore = true)
    void updateFromDto(TransactionRequestDTO dto, @MappingTarget Transaction transaction);
}

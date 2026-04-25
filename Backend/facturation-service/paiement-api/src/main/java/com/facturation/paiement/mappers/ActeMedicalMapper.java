package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.ActeMedicalRequestDTO;
import com.facturation.paiement.dto.ActeMedicalResponseDTO;
import com.facturation.paiement.models.ActeMedical;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ActeMedicalMapper {
    ActeMedical toEntity(ActeMedicalRequestDTO dto);

    ActeMedicalResponseDTO toDto(ActeMedical acteMedical);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromDto(ActeMedicalRequestDTO dto, @MappingTarget ActeMedical acteMedical);
}

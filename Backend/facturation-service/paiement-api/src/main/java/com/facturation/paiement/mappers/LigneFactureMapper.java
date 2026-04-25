package com.facturation.paiement.mappers;

import com.facturation.paiement.dto.LigneFactureRequestDTO;
import com.facturation.paiement.dto.LigneFactureResponseDTO;
import com.facturation.paiement.models.LigneFacture;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface LigneFactureMapper {

    @Mapping(target = "facture", ignore = true)
    @Mapping(target = "acteMedical", ignore = true)
    @Mapping(target = "prixUnitaire", ignore = true)
    @Mapping(target = "sousTotal", ignore = true)
    LigneFacture toEntity(LigneFactureRequestDTO dto);

    @Mapping(target = "libelleActe", source = "acteMedical.libelle")
    @Mapping(target = "factureId", source = "facture.id")
    @Mapping(target = "acteMedicalId", source = "acteMedical.id")
    LigneFactureResponseDTO toDto(LigneFacture ligneFacture);
}

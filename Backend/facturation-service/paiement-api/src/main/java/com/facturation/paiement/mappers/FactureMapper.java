package com.facturation.paiement.mappers;
 
import com.facturation.paiement.dto.FactureRequestDTO;
import com.facturation.paiement.dto.FactureResponseDTO;
import com.facturation.paiement.models.Facture;
import com.facturation.paiement.models.LigneFacture;
import com.facturation.paiement.models.Paiement;
import com.facturation.paiement.models.Remise;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
 
@Mapper(componentModel = "spring", uses = {LigneFactureMapper.class, PaiementMapper.class})
public abstract class FactureMapper {

    @Autowired
    protected LigneFactureMapper ligneFactureMapper;
    
    @Autowired
    protected PaiementMapper paiementMapper;

    public abstract Facture toEntity(FactureRequestDTO dto);
 
    /**
     * Méthode principale de mapping avec calcul des totaux garanti par le pattern Decorator.
     */
    public FactureResponseDTO toDto(Facture facture) {
        if (facture == null) return null;
        
        FactureResponseDTO dto = mapToDto(facture);
        calculateTotaux(facture, dto);
        return dto;
    }

    /**
     * Mappings de base générés par MapStruct.
     */
    @Mapping(target = "lignesFacture", source = "lignesFacture")
    @Mapping(target = "paiements", source = "paiements")
    protected abstract FactureResponseDTO mapToDto(Facture facture);
 
    /**
     * Logique manuelle de calcul des totaux financiers (Auditability).
     */
    protected void calculateTotaux(Facture facture, FactureResponseDTO dto) {
        if (facture == null || dto == null) return;
 
        Double totalVente = 0.0;
        if (facture.getLignesFacture() != null) {
            for (LigneFacture lf : facture.getLignesFacture()) {
                totalVente += (lf.getSousTotal() != null) ? lf.getSousTotal() : 0.0;
            }
        }
        
        Double totalRemisesAutorisees = 0.0;
        if (facture.getRemises() != null) {
            for (Remise r : facture.getRemises()) {
                if (Boolean.TRUE.equals(r.getEstAutorisee())) {
                    totalRemisesAutorisees += r.calculerMontant(totalVente);
                }
            }
        }
 
        Double totalPaye = 0.0;
        if (facture.getPaiements() != null) {
            for (Paiement p : facture.getPaiements()) {
                totalPaye += (p.getMontant() != null) ? p.getMontant() : 0.0;
            }
        }
 
        Double resteAPayer = totalVente - totalRemisesAutorisees - totalPaye;
        if (resteAPayer < 0) resteAPayer = 0.0;
 
        // Plafond de sécurité : le total des remises ne peut pas dépasser le brut
        Double totalRemisesEffectives = Math.min(totalVente, totalRemisesAutorisees);
 
        dto.setTotalRemises(totalRemisesEffectives);
        dto.setTotalPaye(totalPaye);
        dto.setResteAPayer(resteAPayer);
        dto.setMontantBrut(totalVente);
        dto.setMontantNet(totalVente - totalRemisesEffectives);
    }
 
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void updateFromDto(FactureRequestDTO dto, @MappingTarget Facture facture);
}

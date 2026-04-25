package com.facturation.paiement.repository.impl;

import com.facturation.paiement.models.ActeMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActeMedicalJpaRepository extends JpaRepository<ActeMedical, Long> {
    @Query("SELECT lf.acteMedical FROM LigneFacture lf WHERE lf.facture.id = :factureId")
    List<ActeMedical> findByFactureId(@Param("factureId") Long factureId);

    @Query("SELECT COALESCE(SUM(lf.acteMedical.prix), 0) FROM LigneFacture lf WHERE lf.facture.id = :factureId")
    Double sumPrixByFactureId(@Param("factureId") Long factureId);
}

package com.facturation.paiement.repository.impl;

import com.facturation.paiement.models.Remise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RemiseJpaRepository extends JpaRepository<Remise, Long> {
    List<Remise> findByFactureId(Long factureId);
}

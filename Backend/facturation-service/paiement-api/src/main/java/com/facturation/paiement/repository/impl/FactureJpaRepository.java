package com.facturation.paiement.repository.impl;

import com.facturation.paiement.models.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FactureJpaRepository extends JpaRepository<Facture, Long> {
}

package com.facturation.paiement.repository.interfaces;

import com.facturation.paiement.models.Paiement;
import java.util.List;
import java.util.Optional;

public interface PaiementRepositoryInterface {
    Paiement save(Paiement paiement);
    Optional<Paiement> findById(Long id);
    List<Paiement> findAll();
    List<Paiement> findByFactureId(Long factureId);
    void deleteById(Long id);
    boolean existsById(Long id);
}

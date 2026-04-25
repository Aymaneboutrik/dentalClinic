package com.facturation.paiement.repository.interfaces;

import com.facturation.paiement.models.Facture;
import java.util.List;
import java.util.Optional;

public interface FactureRepositoryInterface {
    Facture save(Facture facture);
    Optional<Facture> findById(Long id);
    List<Facture> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}

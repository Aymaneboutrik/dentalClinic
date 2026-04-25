package com.facturation.paiement.repository.interfaces;

import com.facturation.paiement.models.LigneFacture;
import java.util.List;
import java.util.Optional;

public interface LigneFactureRepositoryInterface {
    LigneFacture save(LigneFacture ligneFacture);
    Optional<LigneFacture> findById(Long id);
    List<LigneFacture> findAll();
    List<LigneFacture> findByFactureId(Long factureId);
    void deleteById(Long id);
    boolean existsById(Long id);
}

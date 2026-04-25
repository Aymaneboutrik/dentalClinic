package com.facturation.paiement.repository.interfaces;

import com.facturation.paiement.models.ActeMedical;
import java.util.List;
import java.util.Optional;

/**
 * Interface pour le catalogue des actes médicaux.
 * Désormais indépendant des factures.
 */
public interface ActeMedicalRepositoryInterface {
    ActeMedical save(ActeMedical acteMedical);
    Optional<ActeMedical> findById(Long id);
    List<ActeMedical> findAll();
    List<ActeMedical> findByFactureId(Long id);
    Double sumPrixByFactureId(Long factureId);
    void deleteById(Long id);
    boolean existsById(Long id);
}

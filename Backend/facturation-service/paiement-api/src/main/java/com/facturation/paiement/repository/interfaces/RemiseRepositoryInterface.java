package com.facturation.paiement.repository.interfaces;

import com.facturation.paiement.models.Remise;
import java.util.List;
import java.util.Optional;

public interface RemiseRepositoryInterface {
    Remise save(Remise remise);
    Optional<Remise> findById(Long id);
    List<Remise> findAll();
    List<Remise> findByFactureId(Long factureId);
    void deleteById(Long id);
    boolean existsById(Long id);
}

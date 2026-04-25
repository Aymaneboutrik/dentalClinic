package com.facturation.paiement.repository.impl;

import com.facturation.paiement.models.LigneFacture;
import com.facturation.paiement.repository.interfaces.LigneFactureRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class LigneFactureRepositoryImpl implements LigneFactureRepositoryInterface {
    private final LigneFactureJpaRepository jpaRepository;

    @Override public LigneFacture save(LigneFacture lf) { return jpaRepository.save(lf); }
    @Override public Optional<LigneFacture> findById(Long id) { return jpaRepository.findById(id); }
    @Override public List<LigneFacture> findAll() { return jpaRepository.findAll(); }
    @Override public List<LigneFacture> findByFactureId(Long factureId) { return jpaRepository.findByFactureId(factureId); }
    @Override public void deleteById(Long id) { jpaRepository.deleteById(id); }
    @Override public boolean existsById(Long id) { return jpaRepository.existsById(id); }
}

package com.facturation.paiement.repository.impl;

import com.facturation.paiement.models.Facture;
import com.facturation.paiement.repository.interfaces.FactureRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FactureRepositoryImpl implements FactureRepositoryInterface {
    private final FactureJpaRepository jpaRepository;

    @Override public Facture save(Facture facture) { return jpaRepository.save(facture); }
    @Override public Optional<Facture> findById(Long id) { return jpaRepository.findById(id); }
    @Override public List<Facture> findAll() { return jpaRepository.findAll(); }
    @Override public void deleteById(Long id) { jpaRepository.deleteById(id); }
    @Override public boolean existsById(Long id) { return jpaRepository.existsById(id); }
}

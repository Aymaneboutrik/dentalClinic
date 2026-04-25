package com.facturation.paiement.repository.impl;

import com.facturation.paiement.models.Paiement;
import com.facturation.paiement.repository.interfaces.PaiementRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PaiementRepositoryImpl implements PaiementRepositoryInterface {
    private final PaiementJpaRepository jpaRepository;

    @Override public Paiement save(Paiement p) { return jpaRepository.save(p); }
    @Override public Optional<Paiement> findById(Long id) { return jpaRepository.findById(id); }
    @Override public List<Paiement> findAll() { return jpaRepository.findAll(); }
    @Override public List<Paiement> findByFactureId(Long id) { return jpaRepository.findByFactureId(id); }
    @Override public void deleteById(Long id) { jpaRepository.deleteById(id); }
    @Override public boolean existsById(Long id) { return jpaRepository.existsById(id); }
}

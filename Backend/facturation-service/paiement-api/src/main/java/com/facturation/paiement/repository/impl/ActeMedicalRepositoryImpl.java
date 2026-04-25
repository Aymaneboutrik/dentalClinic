package com.facturation.paiement.repository.impl;

import com.facturation.paiement.models.ActeMedical;
import com.facturation.paiement.repository.interfaces.ActeMedicalRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ActeMedicalRepositoryImpl implements ActeMedicalRepositoryInterface {
    private final ActeMedicalJpaRepository jpaRepository;

    @Override public ActeMedical save(ActeMedical a) { return jpaRepository.save(a); }
    @Override public Optional<ActeMedical> findById(Long id) { return jpaRepository.findById(id); }
    @Override public List<ActeMedical> findAll() { return jpaRepository.findAll(); }
    @Override public List<ActeMedical> findByFactureId(Long id) { return jpaRepository.findByFactureId(id); }
    @Override public Double sumPrixByFactureId(Long factureId) { return jpaRepository.sumPrixByFactureId(factureId); }
    @Override public void deleteById(Long id) { jpaRepository.deleteById(id); }
    @Override public boolean existsById(Long id) { return jpaRepository.existsById(id); }
}

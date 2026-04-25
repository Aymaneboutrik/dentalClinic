package com.facturation.paiement.repository.impl;

import com.facturation.paiement.models.Remise;
import com.facturation.paiement.repository.interfaces.RemiseRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RemiseRepositoryImpl implements RemiseRepositoryInterface {
    private final RemiseJpaRepository jpaRepository;

    @Override public Remise save(Remise r) { return jpaRepository.save(r); }
    @Override public Optional<Remise> findById(Long id) { return jpaRepository.findById(id); }
    @Override public List<Remise> findAll() { return jpaRepository.findAll(); }
    @Override public List<Remise> findByFactureId(Long id) { return jpaRepository.findByFactureId(id); }
    @Override public void deleteById(Long id) { jpaRepository.deleteById(id); }
    @Override public boolean existsById(Long id) { return jpaRepository.existsById(id); }
}

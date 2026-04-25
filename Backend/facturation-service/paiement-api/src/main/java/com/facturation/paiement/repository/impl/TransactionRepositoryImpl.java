package com.facturation.paiement.repository.impl;

import com.facturation.paiement.models.Transaction;
import com.facturation.paiement.repository.interfaces.TransactionRepositoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TransactionRepositoryImpl implements TransactionRepositoryInterface {
    private final TransactionJpaRepository jpaRepository;

    @Override public Transaction save(Transaction t) { return jpaRepository.save(t); }
    @Override public Optional<Transaction> findById(Long id) { return jpaRepository.findById(id); }
    @Override public List<Transaction> findAll() { return jpaRepository.findAll(); }
    @Override public List<Transaction> findByRemiseId(Long id) { return jpaRepository.findByRemiseId(id); }
    @Override public void deleteById(Long id) { jpaRepository.deleteById(id); }
    @Override public boolean existsById(Long id) { return jpaRepository.existsById(id); }
}

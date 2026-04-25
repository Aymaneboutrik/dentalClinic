package com.facturation.paiement.repository.interfaces;

import com.facturation.paiement.models.Transaction;
import java.util.List;
import java.util.Optional;

public interface TransactionRepositoryInterface {
    Transaction save(Transaction transaction);
    Optional<Transaction> findById(Long id);
    List<Transaction> findAll();
    List<Transaction> findByRemiseId(Long remiseId);
    void deleteById(Long id);
    boolean existsById(Long id);
}

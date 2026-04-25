package com.facturation.paiement.repository.impl;

import com.facturation.paiement.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionJpaRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByRemiseId(Long remiseId);
}

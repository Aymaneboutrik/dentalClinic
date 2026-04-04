package com.dental.patient.repository;

import com.dental.patient.domain.LigneOrdonnance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LigneOrdonnanceRepository extends JpaRepository<LigneOrdonnance, Long> {
}

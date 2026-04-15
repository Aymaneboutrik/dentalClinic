package com.dental.patient.repository;

import com.dental.patient.domain.Ordonnance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrdonnanceRepository extends JpaRepository<Ordonnance, Long> {
    Optional<Ordonnance> findByConsultationId(Long consultationId);
}

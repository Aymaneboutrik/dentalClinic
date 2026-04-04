package com.dental.patient.repository;

import com.dental.patient.domain.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByDossierIdOrderByDateConsultationDesc(Long dossierId);
}

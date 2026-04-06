package com.dental.patient.repository;

import com.dental.patient.domain.DocumentMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentMedical, Long> {
    List<DocumentMedical> findByConsultationId(Long consultationId);
    List<DocumentMedical> findByDossierId(Long dossierId);
}

package com.dental.patient.repository;

import com.dental.patient.domain.DossierMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DossierMedicalRepository extends JpaRepository<DossierMedical, Long> {
    Optional<DossierMedical> findByPatientId(Long patientId);
    Optional<DossierMedical> findByCodeDossier(String codeDossier);
}

package com.dental.patient.repository;

import com.dental.patient.domain.ObservationMedicale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObservationRepository extends JpaRepository<ObservationMedicale, Long> {
}

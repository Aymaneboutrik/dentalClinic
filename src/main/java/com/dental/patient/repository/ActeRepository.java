package com.dental.patient.repository;

import com.dental.patient.domain.Acte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActeRepository extends JpaRepository<Acte, Long> {
}

package com.dental.patient.service;

import com.dental.patient.domain.Consultation;
import com.dental.patient.domain.LigneOrdonnance;
import com.dental.patient.domain.Ordonnance;
import com.dental.patient.exception.BadRequestException;
import com.dental.patient.exception.ConflictException;
import com.dental.patient.exception.ResourceNotFoundException;
import com.dental.patient.repository.ConsultationRepository;
import com.dental.patient.repository.OrdonnanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrdonnanceService {

    private final OrdonnanceRepository ordonnanceRepository;
    private final ConsultationRepository consultationRepository;

    public Ordonnance getOrdonnanceById(Long id) {
        return ordonnanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordonnance non trouvée: " + id));
    }

    public Ordonnance getOrdonnanceByConsultation(Long consultationId) {
        return ordonnanceRepository.findByConsultationId(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ordonnance non trouvée pour la consultation: " + consultationId));
    }

    @Transactional
    public Ordonnance createOrdonnance(Long consultationId, List<LigneOrdonnance> lignes) {
        if (ordonnanceRepository.findByConsultationId(consultationId).isPresent()) {
            throw new ConflictException("Une ordonnance existe déjà pour cette consultation.");
        }

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation non trouvée: " + consultationId));

        Ordonnance ordonnance = Ordonnance.builder()
                .consultation(consultation)
                .build();

        for (LigneOrdonnance ligne : lignes) {
            ligne.setOrdonnance(ordonnance);
            ordonnance.getLignes().add(ligne);
        }

        return ordonnanceRepository.save(ordonnance);
    }

    @Transactional
    public Ordonnance updateOrdonnance(Long id, List<LigneOrdonnance> newLignes) {
        Ordonnance ordonnance = getOrdonnanceById(id);

        Map<Long, LigneOrdonnance> existingLignes = ordonnance.getLignes().stream()
                .filter(l -> l.getId() != null)
                .collect(Collectors.toMap(LigneOrdonnance::getId, Function.identity()));

        List<LigneOrdonnance> updatedLignes = new ArrayList<>();

        for (LigneOrdonnance novel : newLignes) {
            if (novel.getId() != null) {
                if (!existingLignes.containsKey(novel.getId())) {
                    throw new BadRequestException(
                            "La ligne d'ID " + novel.getId() + " n'appartient pas à cette ordonnance.");
                }

                LigneOrdonnance existing = existingLignes.get(novel.getId());
                existing.setMedicament(novel.getMedicament());
                existing.setDosage(novel.getDosage());
                existing.setFrequence(novel.getFrequence());
                existing.setDuree(novel.getDuree());
                updatedLignes.add(existing);
            } else {
                novel.setOrdonnance(ordonnance);
                updatedLignes.add(novel);
            }
        }

        ordonnance.getLignes().clear();
        ordonnance.getLignes().addAll(updatedLignes);

        return ordonnanceRepository.save(ordonnance);
    }

    @Transactional
    public void deleteOrdonnance(Long id) {
        if (!ordonnanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ordonnance non trouvée: " + id);
        }
        ordonnanceRepository.deleteById(id);
    }
}

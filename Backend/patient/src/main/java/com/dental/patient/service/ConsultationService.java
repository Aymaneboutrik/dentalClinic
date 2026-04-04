package com.dental.patient.service;

import com.dental.patient.domain.Consultation;
import com.dental.patient.domain.DossierMedical;
import com.dental.patient.domain.ObservationMedicale;
import com.dental.patient.exception.ResourceNotFoundException;
import com.dental.patient.repository.ConsultationRepository;
import com.dental.patient.repository.DossierMedicalRepository;
import com.dental.patient.repository.ObservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final ObservationRepository observationRepository;
    private final DossierMedicalRepository dossierMedicalRepository;

    public List<Consultation> getPatientHistory(Long patientId) {
        return dossierMedicalRepository.findByPatientId(patientId)
                .map(dossier -> consultationRepository.findByDossierIdOrderByDateConsultationDesc(dossier.getId()))
                .orElse(Collections.emptyList());
    }

    @Transactional
    public Consultation addConsultation(Long patientId, String motif, String observationContent) {
        DossierMedical dossier = dossierMedicalRepository.findByPatientId(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier non trouvé pour le patient: " + patientId));

        Consultation consultation = Consultation.builder()
                .motif(motif)
                .dateConsultation(LocalDateTime.now())
                .dossier(dossier)
                .build();

        Consultation savedConsultation = consultationRepository.save(consultation);
        consultationRepository.flush();

        if (observationContent != null && !observationContent.isBlank()) {
            ObservationMedicale observation = ObservationMedicale.builder()
                    .contenu(observationContent)
                    .dateObservation(LocalDateTime.now())
                    .consultation(savedConsultation)
                    .build();
            observationRepository.save(observation);
            savedConsultation.getObservations().add(observation);
            observationRepository.flush();
        }

        return savedConsultation;
    }

    @Transactional
    public Consultation addObservation(Long consultationId, String content) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation non trouvée: " + consultationId));

        ObservationMedicale observation = ObservationMedicale.builder()
                .contenu(content)
                .dateObservation(LocalDateTime.now())
                .consultation(consultation)
                .build();
        
        observationRepository.save(observation);
        consultation.getObservations().add(observation);
        return consultationRepository.save(consultation);
    }

    @Transactional
    public Consultation addAssistantObservation(Long consultationId, String content) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation non trouvée: " + consultationId));

        ObservationMedicale observation = ObservationMedicale.builder()
                .contenu(content)
                .dateObservation(LocalDateTime.now())
                .typeAuteur("ASSISTANTE")
                .consultation(consultation)
                .build();
        
        observationRepository.save(observation);
        consultation.getObservations().add(observation);
        return consultationRepository.save(consultation);
    }
}

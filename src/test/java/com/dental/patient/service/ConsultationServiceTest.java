package com.dental.patient.service;

import com.dental.patient.domain.Consultation;
import com.dental.patient.domain.DossierMedical;
import com.dental.patient.domain.ObservationMedicale;
import com.dental.patient.exception.ResourceNotFoundException;
import com.dental.patient.repository.ConsultationRepository;
import com.dental.patient.repository.DossierMedicalRepository;
import com.dental.patient.repository.ObservationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsultationServiceTest {

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private ObservationRepository observationRepository;

    @Mock
    private DossierMedicalRepository dossierMedicalRepository;

    @InjectMocks
    private ConsultationService consultationService;

    @Test
    void addConsultation_ShouldSaveConsultation_WhenDossierExists() {
        // Arrange
        Long patientId = 1L;
        DossierMedical dossier = new DossierMedical();
        dossier.setId(10L);

        when(dossierMedicalRepository.findByPatientId(patientId)).thenReturn(Optional.of(dossier));
        
        Consultation savedConsultation = new Consultation();
        savedConsultation.setId(100L);
        savedConsultation.setObservations(new ArrayList<>());
        
        when(consultationRepository.save(any(Consultation.class))).thenReturn(savedConsultation);

        // Act
        Consultation result = consultationService.addConsultation(patientId, "Motif test", "Observation test");

        // Assert
        assertNotNull(result);
        verify(consultationRepository, times(1)).save(any(Consultation.class));
        verify(observationRepository, times(1)).save(any(ObservationMedicale.class));
        assertEquals(1, result.getObservations().size());
    }

    @Test
    void addConsultation_ShouldThrowException_WhenDossierNotFound() {
        // Arrange
        Long patientId = 1L;
        when(dossierMedicalRepository.findByPatientId(patientId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
                () -> consultationService.addConsultation(patientId, "Motif", "Obs"));
        
        verify(consultationRepository, never()).save(any(Consultation.class));
    }
}

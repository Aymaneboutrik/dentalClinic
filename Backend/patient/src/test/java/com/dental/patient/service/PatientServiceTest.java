package com.dental.patient.service;

import com.dental.patient.domain.DossierMedical;
import com.dental.patient.domain.Patient;
import com.dental.patient.exception.ConflictException;
import com.dental.patient.exception.ResourceNotFoundException;
import com.dental.patient.repository.DossierMedicalRepository;
import com.dental.patient.repository.PatientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DossierMedicalRepository dossierMedicalRepository;

    @InjectMocks
    private PatientService patientService;

    @Test
    void getPatientById_ShouldReturnPatient_WhenPatientExists() {
        // Arrange
        Patient patient = new Patient();
        patient.setId(1L);
        patient.setNom("Doe");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        // Act
        Patient result = patientService.getPatientById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("Doe", result.getNom());
        verify(patientRepository, times(1)).findById(1L);
    }

    @Test
    void getPatientById_ShouldThrowException_WhenPatientDoesNotExist() {
        // Arrange
        when(patientRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> patientService.getPatientById(1L));
        verify(patientRepository, times(1)).findById(1L);
    }

    @Test
    void addPatient_ShouldSavePatientAndCreateDossier_WhenCinIsUnique() {
        // Arrange
        Patient patient = new Patient();
        patient.setCin("CIN123");

        Patient savedPatient = new Patient();
        savedPatient.setId(1L);
        savedPatient.setCin("CIN123");

        when(patientRepository.findByCin("CIN123")).thenReturn(Optional.empty());
        when(patientRepository.save(patient)).thenReturn(savedPatient);

        // Act
        Patient result = patientService.addPatient(patient);

        // Assert
        assertNotNull(result);
        verify(patientRepository, times(1)).save(patient);
        verify(dossierMedicalRepository, times(1)).save(any(DossierMedical.class));
        assertNotNull(result.getDossierMedical());
    }

    @Test
    void addPatient_ShouldThrowException_WhenCinAlreadyExists() {
        // Arrange
        Patient patient = new Patient();
        patient.setCin("CIN123");

        when(patientRepository.findByCin("CIN123")).thenReturn(Optional.of(new Patient()));

        // Act & Assert
        assertThrows(ConflictException.class, () -> patientService.addPatient(patient));
        verify(patientRepository, never()).save(any(Patient.class));
        verify(dossierMedicalRepository, never()).save(any(DossierMedical.class));
    }
}

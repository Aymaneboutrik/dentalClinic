package com.dental.patient.service;

import com.dental.patient.domain.DossierMedical;
import com.dental.patient.domain.Patient;
import com.dental.patient.exception.ConflictException;
import com.dental.patient.exception.ResourceNotFoundException;
import com.dental.patient.repository.DossierMedicalRepository;
import com.dental.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final DossierMedicalRepository dossierMedicalRepository;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public List<Patient> searchPatients(String query) {
        if (query == null || query.isBlank()) {
            return getAllPatients();
        }
        return patientRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrCinContainingIgnoreCase(
                query, query, query);
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'id: " + id));
    }

    @Transactional
    public Patient addPatient(Patient patient) {
        if (patientRepository.findByCin(patient.getCin()).isPresent()) {
            throw new ConflictException("Un patient avec ce CIN existe déjà");
        }
        
        Patient savedPatient = patientRepository.save(patient);
        
        // Création automatique du dossier médical
        DossierMedical dossier = DossierMedical.builder()
                .codeDossier("DM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .patient(savedPatient)
                .archived(false)
                .build();
        
        dossierMedicalRepository.save(dossier);
        savedPatient.setDossierMedical(dossier);
        
        return savedPatient;
    }

    @Transactional
    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = getPatientById(id);
        
        patient.setNom(patientDetails.getNom());
        patient.setPrenom(patientDetails.getPrenom());
        patient.setDateNaissance(patientDetails.getDateNaissance());
        patient.setAdresse(patientDetails.getAdresse());
        patient.setTelephone(patientDetails.getTelephone());
        patient.setEmail(patientDetails.getEmail());
        patient.setCin(patientDetails.getCin());
        patient.setSexe(patientDetails.getSexe());
        patient.setProfession(patientDetails.getProfession());
        patient.setGroupeSanguin(patientDetails.getGroupeSanguin());
        
        return patientRepository.save(patient);
    }

    @Transactional
    public void archivePatient(Long id) {
        Patient patient = getPatientById(id);
        DossierMedical dossier = patient.getDossierMedical();
        if (dossier != null) {
            dossier.setArchived(true);
            dossierMedicalRepository.save(dossier);
        }
    }

    @Transactional
    public void unarchivePatient(Long id) {
        Patient patient = getPatientById(id);
        DossierMedical dossier = patient.getDossierMedical();
        if (dossier != null) {
            dossier.setArchived(false);
            dossierMedicalRepository.save(dossier);
        }
    }
}

package com.dental.patient.controller;

import com.dental.patient.domain.DocumentMedical;
import com.dental.patient.domain.Patient;
import com.dental.patient.dto.ConsultationDto;
import com.dental.patient.dto.DocumentMedicalDto;
import com.dental.patient.dto.PatientDto;
import com.dental.patient.dto.SecretaryPatientDto;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.repository.PatientRepository;
import com.dental.patient.service.ConsultationService;
import com.dental.patient.service.DocumentService;
import com.dental.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Flux secrétaire : identification patient par CIN uniquement ({@code by-cin}, {@code history-by-cin}).
 * La liste complète sert d'annuaire ; pas de recherche texte ni d'historique par id patient ici.
 */
@RestController
@RequestMapping("/api/sec")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SecretaryController {

    private final PatientService patientService;
    private final DocumentService documentService;
    private final ConsultationService consultationService;
    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @GetMapping("/patients")
    public List<SecretaryPatientDto> listPatients() {
        List<Patient> patients = patientService.getAllPatients();
        return patientMapper.toSecretaryDtoList(patients);
    }

    @GetMapping("/patients/history-by-cin")
    public ResponseEntity<List<ConsultationDto>> getHistoryByCin(@RequestParam String cin) {
        return patientRepository.findByCin(cin)
                .map(patient -> {
                    var history = consultationService.getPatientHistory(patient.getId());
                    return ResponseEntity.ok(patientMapper.toConsultationDtoList(history));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patients/by-cin")
    public ResponseEntity<SecretaryPatientDto> getPatientByCin(@RequestParam String cin) {
        return patientRepository.findByCin(cin)
                .map(patient -> ResponseEntity.ok(patientMapper.toSecretaryDto(patient)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patients")
    public ResponseEntity<SecretaryPatientDto> addPatient(@RequestBody PatientDto patientDto) {
        var patient = patientMapper.toPatientEntity(patientDto);
        Patient saved = patientService.addPatient(patient);
        return ResponseEntity.ok(patientMapper.toSecretaryDto(saved));
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<SecretaryPatientDto> updatePatient(@PathVariable Long id, @RequestBody PatientDto patientDto) {
        var patient = patientMapper.toPatientEntity(patientDto);
        Patient updated = patientService.updatePatient(id, patient);
        return ResponseEntity.ok(patientMapper.toSecretaryDto(updated));
    }

    @PatchMapping("/patients/{id}/archive")
    public ResponseEntity<Void> archivePatient(@PathVariable Long id) {
        patientService.archivePatient(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/patients/{id}/unarchive")
    public ResponseEntity<Void> unarchivePatient(@PathVariable Long id) {
        patientService.unarchivePatient(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/patients/{dossierId}/documents")
    public ResponseEntity<DocumentMedicalDto> uploadAdminDocument(
            @PathVariable Long dossierId,
            @RequestParam("file") MultipartFile file) throws IOException {
        DocumentMedical doc = documentService.uploadDocumentToDossier(dossierId, file, null, "ADMIN");
        return ResponseEntity.ok(patientMapper.toDocumentDto(doc));
    }

    @GetMapping("/patients/{dossierId}/documents")
    public ResponseEntity<List<DocumentMedicalDto>> listDocuments(@PathVariable Long dossierId) {
        List<DocumentMedical> docs = documentService.getDocumentsByDossierAndType(dossierId, "ADMIN");
        return ResponseEntity.ok(docs.stream().map(patientMapper::toDocumentDto).toList());
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) throws IOException {
        DocumentMedical doc = documentService.getDocumentById(id);
        if (!"ADMIN".equalsIgnoreCase(doc.getType())) {
            return ResponseEntity.status(403).build();
        }
        var download = documentService.loadDocumentForDownload(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + download.fileName() + "\"")
                .body(download.content());
    }
}

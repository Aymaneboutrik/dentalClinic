package com.dental.patient.controller;

import com.dental.patient.domain.DocumentMedical;
import com.dental.patient.dto.AddObservationRequest;
import com.dental.patient.dto.ConsultationDto;
import com.dental.patient.dto.DocumentMedicalDto;
import com.dental.patient.dto.PatientDto;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.service.ConsultationService;
import com.dental.patient.service.DocumentService;
import com.dental.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ASSISTANTE', 'DENTISTE')")
public class AssistantController {

    private final PatientService patientService;
    private final ConsultationService consultationService;
    private final DocumentService documentService;
    private final PatientMapper patientMapper;

    // ==========================================
    // 1. CONSULTER DOSSIER PATIENT (Lecture seule)
    // ==========================================

    @GetMapping("/patients/{id}")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientMapper.toPatientDto(patientService.getPatientById(id)));
    }

    @GetMapping("/patients/search")
    public ResponseEntity<List<PatientDto>> searchPatients(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(
                patientService.searchPatients(query).stream()
                        .map(patientMapper::toPatientDto)
                        .collect(Collectors.toList())
        );
    }
    @GetMapping("/patients")
    public ResponseEntity<List<PatientDto>> listAllPatients() {
        return ResponseEntity.ok(
                patientService.searchPatients(null).stream()
                        .map(patientMapper::toPatientDto)
                        .collect(Collectors.toList())
        );  
}

    // ==========================================
    // 2. AJOUTER DES NOTES DE SUIVI (OBSERVATIONS)
    // ==========================================

    @PostMapping("/consultations/{consultationId}/observations")
    public ResponseEntity<ConsultationDto> addObservation(
            @PathVariable Long consultationId,
            @Valid @RequestBody AddObservationRequest request) {
        return ResponseEntity.ok(patientMapper.toConsultationDto(
                consultationService.addAssistantObservation(consultationId, request.getContenu())));
    }

    // ==========================================
    // 3. CONSULTER DOCUMENTS MEDICAUX
    // ==========================================

    @GetMapping("/dossiers/{dossierId}/documents")
    public ResponseEntity<List<DocumentMedicalDto>> listDocumentsForDossier(@PathVariable Long dossierId) {
        List<DocumentMedical> docs = documentService.getDocumentsByDossier(dossierId);
        return ResponseEntity.ok(docs.stream().map(patientMapper::toDocumentDto).toList());
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) throws IOException {
        var download = documentService.loadDocumentForDownload(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + download.fileName() + "\"")
                .body(download.content());
    }

}

package com.dental.patient.controller;

import com.dental.patient.domain.DocumentMedical;
import com.dental.patient.dto.DocumentMedicalDto;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;
    private final PatientMapper patientMapper;

    @PostMapping("/dossier/{dossierId}")
    public ResponseEntity<DocumentMedicalDto> uploadMedicalDocument(
            @PathVariable Long dossierId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String nom,
            @RequestParam(defaultValue = "MEDICAL") String type) throws IOException {
        DocumentMedical doc = documentService.uploadDocumentToDossier(dossierId, file, nom, type);
        return ResponseEntity.ok(patientMapper.toDocumentDto(doc));
    }

    @PostMapping("/consultation/{consultationId}")
    public ResponseEntity<DocumentMedicalDto> uploadToConsultation(
            @PathVariable Long consultationId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String nom,
            @RequestParam(defaultValue = "MEDICAL") String type) throws IOException {
        DocumentMedical doc = documentService.uploadDocument(consultationId, file, nom, type);
        return ResponseEntity.ok(patientMapper.toDocumentDto(doc));
    }

    @GetMapping("/dossier/{dossierId}")
    public ResponseEntity<List<DocumentMedicalDto>> listDocuments(@PathVariable Long dossierId) {
        List<DocumentMedical> docs = documentService.getDocumentsByDossier(dossierId);
        return ResponseEntity.ok(docs.stream().map(patientMapper::toDocumentDto).toList());
    }

    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<List<DocumentMedicalDto>> listConsultationDocuments(@PathVariable Long consultationId) {
        List<DocumentMedical> docs = documentService.getDocumentsByConsultation(consultationId);
        return ResponseEntity.ok(docs.stream().map(patientMapper::toDocumentDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) throws IOException {
        var download = documentService.loadDocumentForDownload(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + download.fileName() + "\"")
                .body(download.content());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) throws IOException {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/name")
    public ResponseEntity<DocumentMedicalDto> updateDocumentName(
            @PathVariable Long id,
            @RequestParam String nom) {
        DocumentMedical doc = documentService.updateDocumentName(id, nom);
        return ResponseEntity.ok(patientMapper.toDocumentDto(doc));
    }
}

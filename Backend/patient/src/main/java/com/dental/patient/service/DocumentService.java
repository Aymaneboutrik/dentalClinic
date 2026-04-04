package com.dental.patient.service;

import com.dental.patient.domain.Consultation;
import com.dental.patient.domain.DocumentMedical;
import com.dental.patient.domain.DossierMedical;
import com.dental.patient.dto.DocumentDownload;
import com.dental.patient.exception.ResourceNotFoundException;
import com.dental.patient.repository.ConsultationRepository;
import com.dental.patient.repository.DocumentRepository;
import com.dental.patient.repository.DossierMedicalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ConsultationRepository consultationRepository;
    private final DossierMedicalRepository dossierMedicalRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public DocumentMedical uploadDocument(Long consultationId, MultipartFile file, String type) throws IOException {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation non trouvée: " + consultationId));

        Path root = Paths.get(uploadDir);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path targetPath = root.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        DocumentMedical document = DocumentMedical.builder()
                .nom(file.getOriginalFilename())
                .type(type)
                .chemin(targetPath.toString())
                .consultation(consultation)
                .build();

        return documentRepository.save(document);
    }

    public DocumentMedical uploadDocumentToDossier(Long dossierId, MultipartFile file, String type) throws IOException {
        DossierMedical dossier = dossierMedicalRepository.findById(dossierId)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier non trouvé: " + dossierId));

        Path root = Paths.get(uploadDir);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path targetPath = root.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        DocumentMedical document = DocumentMedical.builder()
                .nom(file.getOriginalFilename())
                .type(type)
                .chemin(targetPath.toString())
                .dossier(dossier)
                .build();

        return documentRepository.save(document);
    }

    public DocumentMedical getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document non trouvé: " + id));
    }

    public DocumentDownload loadDocumentForDownload(Long id) throws IOException {
        DocumentMedical document = getDocumentById(id);
        Path path = Paths.get(document.getChemin());
        byte[] content = Files.readAllBytes(path);
        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return new DocumentDownload(document.getNom(), contentType, content);
    }

    public List<DocumentMedical> getDocumentsByConsultation(Long consultationId) {
        return documentRepository.findByConsultationId(consultationId);
    }

    public List<DocumentMedical> getDocumentsByDossier(Long dossierId) {
        return documentRepository.findByDossierId(dossierId);
    }
}

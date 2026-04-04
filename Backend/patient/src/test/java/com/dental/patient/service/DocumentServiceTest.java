package com.dental.patient.service;

import com.dental.patient.domain.DocumentMedical;
import com.dental.patient.exception.ResourceNotFoundException;
import com.dental.patient.repository.ConsultationRepository;
import com.dental.patient.repository.DocumentRepository;
import com.dental.patient.repository.DossierMedicalRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private DossierMedicalRepository dossierMedicalRepository;

    @InjectMocks
    private DocumentService documentService;

    @Test
    void getDocumentById_ShouldReturnDocument_WhenExists() {
        // Arrange
        DocumentMedical doc = new DocumentMedical();
        doc.setId(1L);
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc));

        // Act
        DocumentMedical result = documentService.getDocumentById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getDocumentById_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(documentRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> documentService.getDocumentById(1L));
    }
}

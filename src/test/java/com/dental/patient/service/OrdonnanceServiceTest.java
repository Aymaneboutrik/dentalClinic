package com.dental.patient.service;

import com.dental.patient.domain.Consultation;
import com.dental.patient.domain.LigneOrdonnance;
import com.dental.patient.domain.Ordonnance;
import com.dental.patient.exception.ConflictException;
import com.dental.patient.exception.ResourceNotFoundException;
import com.dental.patient.repository.ConsultationRepository;
import com.dental.patient.repository.OrdonnanceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrdonnanceServiceTest {

    @Mock
    private OrdonnanceRepository ordonnanceRepository;

    @Mock
    private ConsultationRepository consultationRepository;

    @InjectMocks
    private OrdonnanceService ordonnanceService;

    @Test
    void createOrdonnance_ShouldSaveOrdonnance_WhenValid() {
        // Arrange
        Long consultationId = 1L;
        Consultation consultation = new Consultation();
        consultation.setId(consultationId);

        when(ordonnanceRepository.findByConsultationId(consultationId)).thenReturn(Optional.empty());
        when(consultationRepository.findById(consultationId)).thenReturn(Optional.of(consultation));
        when(ordonnanceRepository.save(any(Ordonnance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<LigneOrdonnance> lignes = Arrays.asList(new LigneOrdonnance());

        // Act
        Ordonnance result = ordonnanceService.createOrdonnance(consultationId, lignes);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getLignes().size());
        assertEquals(consultation, result.getConsultation());
        verify(ordonnanceRepository, times(1)).save(any(Ordonnance.class));
    }

    @Test
    void createOrdonnance_ShouldThrowException_WhenOrdonnanceAlreadyExists() {
        // Arrange
        Long consultationId = 1L;
        when(ordonnanceRepository.findByConsultationId(consultationId)).thenReturn(Optional.of(new Ordonnance()));

        // Act & Assert
        assertThrows(ConflictException.class, 
                () -> ordonnanceService.createOrdonnance(consultationId, Arrays.asList(new LigneOrdonnance())));
        
        verify(consultationRepository, never()).findById(anyLong());
        verify(ordonnanceRepository, never()).save(any(Ordonnance.class));
    }
}

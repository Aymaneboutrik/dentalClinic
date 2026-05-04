package com.dental.patient.controller;

import com.dental.patient.dto.AddObservationRequest;
import com.dental.patient.dto.ConsultationDto;
import com.dental.patient.dto.CreateConsultationRequest;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConsultationController {

    private final ConsultationService consultationService;
    private final PatientMapper patientMapper;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<List<ConsultationDto>> getHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(patientMapper.toConsultationDtoList(consultationService.getPatientHistory(patientId)));
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'ASSISTANTE')")
    public ResponseEntity<ConsultationDto> addConsultation(
            @PathVariable Long patientId,
            @Valid @RequestBody CreateConsultationRequest request) {
        return ResponseEntity.ok(patientMapper.toConsultationDto(
                consultationService.addConsultation(patientId, request.getMotif(), request.getObservation())));
    }

    @PostMapping("/{consultationId}/observations")
    @PreAuthorize("hasAnyRole('DENTISTE', 'ASSISTANTE')")
    public ResponseEntity<ConsultationDto> addObservation(
            @PathVariable Long consultationId,
            @Valid @RequestBody AddObservationRequest request) {
        return ResponseEntity.ok(patientMapper.toConsultationDto(
                consultationService.addObservation(consultationId, request.getContenu())));
    }
}

package com.dental.patient.controller;

import com.dental.patient.dto.LigneOrdonnanceDto;
import com.dental.patient.dto.OrdonnanceDto;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.service.OrdonnanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordonnances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class OrdonnanceController {

    private final OrdonnanceService ordonnanceService;
    private final PatientMapper patientMapper;

    @GetMapping("/{id}")
    public ResponseEntity<OrdonnanceDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(patientMapper.toOrdonnanceDto(ordonnanceService.getOrdonnanceById(id)));
    }

    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<OrdonnanceDto> getByConsultation(@PathVariable Long consultationId) {
        return ResponseEntity.ok(patientMapper.toOrdonnanceDto(ordonnanceService.getOrdonnanceByConsultation(consultationId)));
    }

    @PostMapping("/consultation/{consultationId}")
    public ResponseEntity<OrdonnanceDto> create(
            @PathVariable Long consultationId,
            @Valid @RequestBody List<LigneOrdonnanceDto> lignesDto) {
        var lignes = lignesDto.stream().map(patientMapper::toLigneEntity).toList();
        return ResponseEntity.ok(patientMapper.toOrdonnanceDto(ordonnanceService.createOrdonnance(consultationId, lignes)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdonnanceDto> update(
            @PathVariable Long id,
            @Valid @RequestBody List<LigneOrdonnanceDto> lignesDto) {
        var lignes = lignesDto.stream().map(patientMapper::toLigneEntity).toList();
        return ResponseEntity.ok(patientMapper.toOrdonnanceDto(ordonnanceService.updateOrdonnance(id, lignes)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ordonnanceService.deleteOrdonnance(id);
        return ResponseEntity.ok().build();
    }
}

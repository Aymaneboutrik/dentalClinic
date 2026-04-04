package com.dental.patient.controller;

import com.dental.patient.dto.PatientDto;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;
    private final PatientMapper patientMapper;

    @GetMapping
    public List<PatientDto> getAllPatients(@RequestParam(required = false) String query) {
        if (query != null && !query.isBlank()) {
            return patientMapper.toPatientDtoList(patientService.searchPatients(query));
        }
        return patientMapper.toPatientDtoList(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientMapper.toPatientDto(patientService.getPatientById(id)));
    }

    @PostMapping
    public ResponseEntity<PatientDto> addPatient(@Valid @RequestBody PatientDto patientDto) {
        var patient = patientMapper.toPatientEntity(patientDto);
        PatientDto created = patientMapper.toPatientDto(patientService.addPatient(patient));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDto> updatePatient(@PathVariable Long id, @Valid @RequestBody PatientDto patientDto) {
        var patient = patientMapper.toPatientEntity(patientDto);
        return ResponseEntity.ok(patientMapper.toPatientDto(patientService.updatePatient(id, patient)));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Void> archivePatient(@PathVariable Long id) {
        patientService.archivePatient(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/unarchive")
    public ResponseEntity<Void> unarchivePatient(@PathVariable Long id) {
        patientService.unarchivePatient(id);
        return ResponseEntity.ok().build();
    }
}

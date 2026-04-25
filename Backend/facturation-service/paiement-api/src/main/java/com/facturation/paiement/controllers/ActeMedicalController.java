package com.facturation.paiement.controllers;

import com.facturation.paiement.dto.ActeMedicalRequestDTO;
import com.facturation.paiement.dto.ActeMedicalResponseDTO;
import com.facturation.paiement.services.ActeMedicalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/actes-medicaux")
@RequiredArgsConstructor
public class ActeMedicalController {

    private final ActeMedicalService acteMedicalService;

    @PostMapping
    public ResponseEntity<ActeMedicalResponseDTO> create(@Valid @RequestBody ActeMedicalRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(acteMedicalService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActeMedicalResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(acteMedicalService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<ActeMedicalResponseDTO>> findAll() {
        return ResponseEntity.ok(acteMedicalService.findAll());
    }

    @GetMapping("/facture/{factureId}")
    public ResponseEntity<List<ActeMedicalResponseDTO>> findByFactureId(@PathVariable Long factureId) {
        return ResponseEntity.ok(acteMedicalService.findByFactureId(factureId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActeMedicalResponseDTO> update(@PathVariable Long id,
                                                          @Valid @RequestBody ActeMedicalRequestDTO dto) {
        return ResponseEntity.ok(acteMedicalService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        acteMedicalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

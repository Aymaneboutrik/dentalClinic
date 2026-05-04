package com.facturation.paiement.controllers;

import com.facturation.paiement.dto.ActeMedicalRequestDTO;
import com.facturation.paiement.dto.ActeMedicalResponseDTO;
import com.facturation.paiement.services.ActeMedicalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/actes-medicaux")
@RequiredArgsConstructor
public class ActeMedicalController {

    private final ActeMedicalService acteMedicalService;

    @PostMapping
    @PreAuthorize("hasRole('DENTISTE')")
    public ResponseEntity<ActeMedicalResponseDTO> create(@Valid @RequestBody ActeMedicalRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(acteMedicalService.create(dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<ActeMedicalResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(acteMedicalService.findById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<List<ActeMedicalResponseDTO>> findAll() {
        return ResponseEntity.ok(acteMedicalService.findAll());
    }

    @GetMapping("/facture/{factureId}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<List<ActeMedicalResponseDTO>> findByFactureId(@PathVariable Long factureId) {
        return ResponseEntity.ok(acteMedicalService.findByFactureId(factureId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DENTISTE')")
    public ResponseEntity<ActeMedicalResponseDTO> update(@PathVariable Long id,
                                                          @Valid @RequestBody ActeMedicalRequestDTO dto) {
        return ResponseEntity.ok(acteMedicalService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DENTISTE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        acteMedicalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

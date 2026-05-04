package com.facturation.paiement.controllers;

import com.facturation.paiement.dto.PaiementRequestDTO;
import com.facturation.paiement.dto.PaiementResponseDTO;
import com.facturation.paiement.services.PaiementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/paiements")
@RequiredArgsConstructor
public class PaiementController {

    private final PaiementService paiementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE')")
    public ResponseEntity<PaiementResponseDTO> create(@Valid @RequestBody PaiementRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paiementService.create(dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<PaiementResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(paiementService.findById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<List<PaiementResponseDTO>> findAll() {
        return ResponseEntity.ok(paiementService.findAll());
    }

    @GetMapping("/facture/{factureId}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<List<PaiementResponseDTO>> findByFactureId(@PathVariable Long factureId) {
        return ResponseEntity.ok(paiementService.findByFactureId(factureId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE')")
    public ResponseEntity<PaiementResponseDTO> update(@PathVariable Long id,
                                                       @Valid @RequestBody PaiementRequestDTO dto) {
        return ResponseEntity.ok(paiementService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paiementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

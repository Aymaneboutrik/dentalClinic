package com.facturation.paiement.controllers;

import com.facturation.paiement.dto.LigneFactureRequestDTO;
import com.facturation.paiement.dto.LigneFactureResponseDTO;
import com.facturation.paiement.services.LigneFactureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lignes-facture")
@RequiredArgsConstructor
public class LigneFactureController {

    private final LigneFactureService ligneFactureService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE')")
    public ResponseEntity<LigneFactureResponseDTO> create(@Valid @RequestBody LigneFactureRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ligneFactureService.create(dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<LigneFactureResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ligneFactureService.findById(id));
    }

    @GetMapping("/facture/{factureId}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<List<LigneFactureResponseDTO>> findByFactureId(@PathVariable Long factureId) {
        return ResponseEntity.ok(ligneFactureService.findByFactureId(factureId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE')")
    public ResponseEntity<LigneFactureResponseDTO> update(@PathVariable Long id,
                                                           @Valid @RequestBody LigneFactureRequestDTO dto) {
        return ResponseEntity.ok(ligneFactureService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ligneFactureService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

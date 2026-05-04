package com.facturation.paiement.controllers;

import com.facturation.paiement.dto.LigneFactureRequestDTO;
import com.facturation.paiement.dto.LigneFactureResponseDTO;
import com.facturation.paiement.services.LigneFactureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lignes-facture")
@RequiredArgsConstructor
public class LigneFactureController {

    private final LigneFactureService ligneFactureService;

    @PostMapping
    public ResponseEntity<LigneFactureResponseDTO> create(@Valid @RequestBody LigneFactureRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ligneFactureService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LigneFactureResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ligneFactureService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<LigneFactureResponseDTO>> findAll() {
        return ResponseEntity.ok(ligneFactureService.findAll());
    }

    @GetMapping("/facture/{factureId}")
    public ResponseEntity<List<LigneFactureResponseDTO>> findByFactureId(@PathVariable Long factureId) {
        return ResponseEntity.ok(ligneFactureService.findByFactureId(factureId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LigneFactureResponseDTO> update(@PathVariable Long id,
                                                           @Valid @RequestBody LigneFactureRequestDTO dto) {
        return ResponseEntity.ok(ligneFactureService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ligneFactureService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

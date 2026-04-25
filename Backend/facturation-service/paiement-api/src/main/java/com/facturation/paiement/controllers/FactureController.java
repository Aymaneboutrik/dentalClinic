package com.facturation.paiement.controllers;

import com.facturation.paiement.dto.FactureRequestDTO;
import com.facturation.paiement.dto.FactureResponseDTO;
import com.facturation.paiement.dto.FicheFactureDTO;
import com.facturation.paiement.services.FactureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/factures")
@RequiredArgsConstructor
public class FactureController {

    private final FactureService factureService;

    @PostMapping
    public ResponseEntity<FactureResponseDTO> create(@Valid @RequestBody FactureRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(factureService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FactureResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(factureService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<FactureResponseDTO>> findAll() {
        return ResponseEntity.ok(factureService.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<FactureResponseDTO> update(@PathVariable Long id,
                                                      @Valid @RequestBody FactureRequestDTO dto) {
        return ResponseEntity.ok(factureService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        factureService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/fiche")
    public ResponseEntity<FicheFactureDTO> getFicheFacture(@PathVariable Long id) {
        return ResponseEntity.ok(factureService.getFicheFacture(id));
    }
}

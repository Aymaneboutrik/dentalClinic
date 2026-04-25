package com.facturation.paiement.controllers;

import com.facturation.paiement.dto.RemiseRequestDTO;
import com.facturation.paiement.dto.RemiseResponseDTO;
import com.facturation.paiement.services.RemiseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/remises")
@RequiredArgsConstructor
public class RemiseController {

    private final RemiseService remiseService;

    @PostMapping
    public ResponseEntity<RemiseResponseDTO> create(@Valid @RequestBody RemiseRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(remiseService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RemiseResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(remiseService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<RemiseResponseDTO>> findAll() {
        return ResponseEntity.ok(remiseService.findAll());
    }

    @GetMapping("/facture/{factureId}")
    public ResponseEntity<List<RemiseResponseDTO>> findByFactureId(@PathVariable Long factureId) {
        return ResponseEntity.ok(remiseService.findByFactureId(factureId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RemiseResponseDTO> update(@PathVariable Long id,
                                                     @Valid @RequestBody RemiseRequestDTO dto) {
        return ResponseEntity.ok(remiseService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        remiseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package com.facturation.paiement.controllers;

import com.facturation.paiement.dto.TransactionRequestDTO;
import com.facturation.paiement.dto.TransactionResponseDTO;
import com.facturation.paiement.services.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE')")
    public ResponseEntity<TransactionResponseDTO> create(@Valid @RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.save(dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<TransactionResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<List<TransactionResponseDTO>> findAll() {
        return ResponseEntity.ok(transactionService.findAll());
    }

    @GetMapping("/remise/{remiseId}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE', 'ASSISTANTE')")
    public ResponseEntity<List<TransactionResponseDTO>> findByRemiseId(@PathVariable Long remiseId) {
        return ResponseEntity.ok(transactionService.findByRemiseId(remiseId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE')")
    public ResponseEntity<TransactionResponseDTO> update(@PathVariable Long id,
                                                          @Valid @RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.ok(transactionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTISTE', 'SECRETAIRE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

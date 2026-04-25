package com.facturation.paiement.controllers;

import com.facturation.paiement.dto.TransactionRequestDTO;
import com.facturation.paiement.dto.TransactionResponseDTO;
import com.facturation.paiement.services.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponseDTO> create(@Valid @RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.save(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponseDTO>> findAll() {
        return ResponseEntity.ok(transactionService.findAll());
    }

    @GetMapping("/remise/{remiseId}")
    public ResponseEntity<List<TransactionResponseDTO>> findByRemiseId(@PathVariable Long remiseId) {
        return ResponseEntity.ok(transactionService.findByRemiseId(remiseId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> update(@PathVariable Long id,
                                                          @Valid @RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.ok(transactionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

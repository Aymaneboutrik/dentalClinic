package com.javaguides.auth_service.controller;

import com.javaguides.auth_service.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@PreAuthorize("hasRole('DENTISTE')")
public class StatsController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @GetMapping
    public ResponseEntity<?> getStats() {
        long activeUsers = utilisateurRepository.countByActifTrue();

        return ResponseEntity.ok(Map.of(
                "activeUsers", activeUsers));
    }
}

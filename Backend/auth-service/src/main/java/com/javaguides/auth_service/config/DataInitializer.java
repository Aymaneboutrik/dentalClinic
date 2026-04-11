package com.javaguides.auth_service.config;

import com.javaguides.auth_service.models.Secretaire;
import com.javaguides.auth_service.models.Assistante;

import com.javaguides.auth_service.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Secretaire if not exists
            if (utilisateurRepository.findByEmail("secretaire@clinic.com").isEmpty()) {
                Secretaire secretaire = new Secretaire();
                secretaire.setNom("Amouri");
                secretaire.setPrenom("Chaymae");
                secretaire.setEmail("secretaire@clinic.com");
                secretaire.setMotDePasse(passwordEncoder.encode("secret123"));
                secretaire.setActif(true);
                secretaire.setDateCreation(LocalDateTime.now());
                utilisateurRepository.save(secretaire);
                System.out.println("✅ Secretaire created: secretaire@clinic.com / secret123");
            }

            // Seed Assistant if not exists
            if (utilisateurRepository.findByEmail("assistant@clinic.com").isEmpty()) {
                Assistante assistant = new Assistante();
                assistant.setNom("Benali");
                assistant.setPrenom("Ahmad");
                assistant.setEmail("assistant@clinic.com");
                assistant.setMotDePasse(passwordEncoder.encode("assistant123"));
                assistant.setActif(true);
                assistant.setDateCreation(LocalDateTime.now());
                utilisateurRepository.save(assistant);
                System.out.println("✅ Assistant created: assistant@clinic.com / assistant123");
            }
        };
    }

}

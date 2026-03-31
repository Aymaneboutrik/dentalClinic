package com.javaguides.auth_service.config;

import com.javaguides.auth_service.models.Assistante;
import com.javaguides.auth_service.models.Dentiste;
import com.javaguides.auth_service.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UtilisateurRepository repository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (repository.count() == 0) {
                // 1. Créer le Dentiste (Admin)
                Dentiste dentiste = new Dentiste();
                dentiste.setNom("Amouri");
                dentiste.setPrenom("Chaymae");
                dentiste.setEmail("chaymaeamouri68@gmail.com");
                dentiste.setMotDePasse(passwordEncoder.encode("dentiste123"));
                dentiste.setActif(true);
                repository.save(dentiste);

                // 2. Créer l'Assistante
                Assistante assistante = new Assistante();
                assistante.setNom("Dupont");
                assistante.setPrenom("Marie");
                assistante.setEmail("marie@cabinet.com");
                assistante.setMotDePasse(passwordEncoder.encode("assistante123"));
                assistante.setActif(true);
                repository.save(assistante);

                System.out.println("--- Données de test initialisées ---");
                System.out.println("Dentiste : chaymaeamouri68@gmail.com / dentiste123");
                System.out.println("Assistante : marie@cabinet.com / assistante123");
                System.out.println("-------------------------------------");
            }
        };
    }
}

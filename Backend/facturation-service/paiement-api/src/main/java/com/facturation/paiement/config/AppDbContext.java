package com.facturation.paiement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * AppDbContext - Équivalent Spring Boot du DbContext .NET.
 * Spring Data JPA gère automatiquement les entités annotées @Entity.
 * Les repositories JPA sont activés via @EnableJpaRepositories.
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.facturation.paiement.repository.impl")
@EnableTransactionManagement
public class AppDbContext {
    // La configuration DataSource est gérée via application.properties
    // Les entités sont détectées automatiquement par Spring Boot
}

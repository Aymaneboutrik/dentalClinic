package com.facturation.paiement;

import com.facturation.paiement.dto.RemiseRequestDTO;
import com.facturation.paiement.dto.RemiseResponseDTO;
import com.facturation.paiement.dto.TransactionResponseDTO;
import com.facturation.paiement.enums.TypeRemise;
import com.facturation.paiement.services.RemiseService;
import com.facturation.paiement.services.TransactionService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * MainTransactionDemo - Classe Main qui enchaîne :
 * 1. Création d'une remise
 * 2. Calcul de la remise (calculerMontant)
 * 3. Modification de la remise
 * 4. Suppression de la remise
 *
 * Activée uniquement avec le profil "demo" pour ne pas s'exécuter en production.
 * Lancer avec : --spring.profiles.active=demo
 */
@Component
@Profile("demo")
@RequiredArgsConstructor
public class MainTransactionDemo implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MainTransactionDemo.class);

    private final RemiseService remiseService;
    private final TransactionService transactionService;

    @Override
    public void run(String... args) {
        log.info("=== DEMO TRANSACTION : Début ===");

        // ÉTAPE 1 : Création d'une remise (facture ID=1 doit exister)
        RemiseRequestDTO createDTO = RemiseRequestDTO.builder()
                .valeur(10.0)
                .dateRemise(LocalDate.now())
                .description("Remise variable de 10%")
                .typeRemise(TypeRemise.VARIABLE)
                .factureId(1L)
                .build();

        RemiseResponseDTO created = remiseService.create(createDTO);
        log.info("ÉTAPE 1 - Remise créée : ID={}, Montant calculé={}", created.getId(), created.getMontantCalcule());

        // ÉTAPE 2 : Lister les transactions associées à cette remise
        transactionService.findByRemiseId(created.getId())
                .forEach(t -> log.info("ÉTAPE 2 - Transaction enregistrée : avant={}, après={}", t.getMontantAvant(), t.getMontantApres()));

        // ÉTAPE 3 : Modification de la remise
        RemiseRequestDTO updateDTO = RemiseRequestDTO.builder()
                .valeur(20.0)
                .dateRemise(LocalDate.now())
                .description("Remise variable modifiée à 20%")
                .typeRemise(TypeRemise.VARIABLE)
                .factureId(1L)
                .build();

        RemiseResponseDTO updated = remiseService.update(created.getId(), updateDTO);
        log.info("ÉTAPE 3 - Remise modifiée : ID={}, Nouveau montant calculé={}", updated.getId(), updated.getMontantCalcule());

        // ÉTAPE 4 : Suppression de la remise
        remiseService.delete(updated.getId());
        log.info("ÉTAPE 4 - Remise ID={} supprimée avec succès.", updated.getId());

        log.info("=== DEMO TRANSACTION : Fin ===");
    }
}

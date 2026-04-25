package com.facturation.paiement.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);


    public void alerteCritiqueFactureImpayee(Long factureId) {
        log.error("[ALERTE CRITIQUE] Facture ID={} contient un ou plusieurs paiements IMPAYÉS !", factureId);
    }
}

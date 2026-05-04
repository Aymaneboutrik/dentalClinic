-- ============================================================
-- Script d'initialisation - Base de données paiementdb
-- Modèle Excellence : Brut/Net + Autorisation Remises
-- ============================================================

-- ============================================================
-- TABLE : facture
-- ============================================================
CREATE TABLE IF NOT EXISTS facture (
    id            BIGSERIAL    PRIMARY KEY,
    montant_brut  DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (montant_brut >= 0),
    montant_net   DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (montant_net >= 0),
    statut        VARCHAR(50)  NOT NULL DEFAULT 'IMPAYE' CHECK (statut IN ('IMPAYE', 'PARTIEL', 'PAYEE')),
    date          DATE         NOT NULL
);

-- ============================================================
-- TABLE : acte_medical (Catalogue indépendant)
-- ============================================================
CREATE TABLE IF NOT EXISTS acte_medical (
    id          BIGSERIAL    PRIMARY KEY,
    libelle     VARCHAR(255) NOT NULL,
    prix        DOUBLE PRECISION NOT NULL CHECK (prix > 0),
    type_acte   VARCHAR(20)  NOT NULL CHECK (type_acte IN ('CONSULTATION', 'ANALYSE', 'SOIN'))
);

-- ============================================================
-- TABLE : ligne_facture (Composition de la Facture)
-- ============================================================
CREATE TABLE IF NOT EXISTS ligne_facture (
    id              BIGSERIAL    PRIMARY KEY,
    facture_id      BIGINT       NOT NULL REFERENCES facture(id) ON DELETE CASCADE,
    acte_medical_id BIGINT       NOT NULL REFERENCES acte_medical(id),
    quantite        INTEGER      NOT NULL CHECK (quantite > 0),
    prix_unitaire   DOUBLE PRECISION NOT NULL,
    sous_total      DOUBLE PRECISION NOT NULL
);

-- ============================================================
-- TABLE : paiement
-- ============================================================
CREATE TABLE IF NOT EXISTS paiement (
    id              BIGSERIAL    PRIMARY KEY,
    date_paiement   DATE         NOT NULL,
    montant         DOUBLE PRECISION NOT NULL CHECK (montant > 0),
    mode_paiement   VARCHAR(50)  NOT NULL,
    facture_id      BIGINT       NOT NULL REFERENCES facture(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : remise
-- ============================================================
CREATE TABLE IF NOT EXISTS remise (
    id             BIGSERIAL    PRIMARY KEY,
    valeur         DOUBLE PRECISION NOT NULL CHECK (valeur > 0),
    date_remise    DATE         NOT NULL,
    description    VARCHAR(500),
    type_remise    VARCHAR(20)  NOT NULL CHECK (type_remise IN ('FIXE', 'VARIABLE')),
    est_autorisee  BOOLEAN      NOT NULL DEFAULT FALSE,
    facture_id     BIGINT       NOT NULL REFERENCES facture(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : transaction (Historique des remises)
-- ============================================================
CREATE TABLE IF NOT EXISTS transaction (
    id             BIGSERIAL    PRIMARY KEY,
    date           TIMESTAMP    NOT NULL,
    montant_avant  DOUBLE PRECISION NOT NULL,
    montant_apres  DOUBLE PRECISION NOT NULL,
    montant_remise DOUBLE PRECISION NOT NULL,
    remise_id      BIGINT       REFERENCES remise(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEX POUR LA PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_paiement_facture      ON paiement(facture_id);
CREATE INDEX IF NOT EXISTS idx_ligne_facture_fact    ON ligne_facture(facture_id);
CREATE INDEX IF NOT EXISTS idx_ligne_facture_acte    ON ligne_facture(acte_medical_id);
CREATE INDEX IF NOT EXISTS idx_remise_facture         ON remise(facture_id);
CREATE INDEX IF NOT EXISTS idx_transaction_remise     ON transaction(remise_id);


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

-- ============================================================
-- DONNÉES DE TEST COHÉRENTES
-- ============================================================

-- 1. Catalogue d'actes
INSERT INTO acte_medical (libelle, prix, type_acte) VALUES
    ('Consultation générale',      150.00, 'CONSULTATION'),
    ('Radiographie thorax',        300.00, 'SOIN'),
    ('Analyse sanguine complète',  250.00, 'ANALYSE'),
    ('Échographie abdominale',     400.00, 'SOIN'),
    ('IRM cérébrale',             1200.00, 'SOIN'),
    ('Bilan biologique',           220.00, 'ANALYSE');

-- 2. Factures
-- Facture 1 : Brut 700, Remise autorisée 10% (70), Net 630, Payé 300 -> PARTIEL
-- Facture 2 : Brut 400, Net 400, Payé 400 -> PAYEE
-- Facture 3 : Brut 1600, Remise NON autorisée (240), Net 1600, Payé 500 -> PARTIEL
INSERT INTO facture (id, montant_brut, montant_net, statut, date) VALUES
    (1, 700.00,  630.00,  'PARTIEL', '2024-01-15'),
    (2, 400.00,  400.00,  'PAYEE',   '2024-02-20'),
    (3, 1600.00, 1600.00, 'PARTIEL', '2024-03-10');
ALTER SEQUENCE facture_id_seq RESTART WITH 4;

-- 3. Lignes de facture
INSERT INTO ligne_facture (facture_id, acte_medical_id, quantite, prix_unitaire, sous_total) VALUES
    (1, 1, 1, 150.00, 150.00),
    (1, 2, 1, 300.00, 300.00),
    (1, 3, 1, 250.00, 250.00),
    (2, 4, 1, 400.00, 400.00),
    (3, 5, 1, 1200.00, 1200.00),
    (3, 6, 1, 220.00, 220.00),
    (3, 1, 1, 180.00, 180.00); 

-- 4. Paiements
INSERT INTO paiement (date_paiement, montant, mode_paiement, facture_id) VALUES
    ('2024-01-20', 300.00,  'CARTE_BANCAIRE', 1),
    ('2024-02-25', 400.00,  'ESPECES',        2),
    ('2024-03-15', 500.00,  'CHEQUE',         3);

-- 5. Remises
INSERT INTO remise (id, valeur, date_remise, description, type_remise, est_autorisee, facture_id) VALUES
    (1, 10.0,  '2024-01-15', 'Remise fidélité 10%',    'VARIABLE', TRUE,  1),
    (2, 15.0,  '2024-03-10', 'Remise assurance 15%',   'VARIABLE', FALSE, 3);
ALTER SEQUENCE remise_id_seq RESTART WITH 3;

-- 6. Transactions
INSERT INTO transaction (date, montant_avant, montant_apres, montant_remise, remise_id) VALUES
    ('2024-01-15 10:00:00', 700.00,  630.00,  70.0, 1),
    ('2024-03-10 09:15:00', 1600.00, 1600.00, 0.0, 2);

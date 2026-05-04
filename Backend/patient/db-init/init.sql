-- Create Tables based on Class Diagram

-- Table: Patients
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(150),
    cin VARCHAR(50) UNIQUE,
    sexe VARCHAR(10),
    profession VARCHAR(100),
    groupe_sanguin VARCHAR(5)
);

-- Table: Dossiers Medicaux
CREATE TABLE IF NOT EXISTS dossiers_medicaux (
    id SERIAL PRIMARY KEY,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    code_dossier VARCHAR(50) UNIQUE NOT NULL,
    archived BOOLEAN DEFAULT FALSE,
    patient_id INTEGER UNIQUE REFERENCES patients(id) ON DELETE CASCADE
);

-- Table: Consultations
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    date_consultation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motif TEXT,
    dossier_id INTEGER REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
    utilisateur_id INTEGER
);

-- Table: Actes (Dental procedures)
CREATE TABLE IF NOT EXISTS actes (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    prix DECIMAL(10, 2) NOT NULL
);

-- Table: Consultation_Actes (Join table)
CREATE TABLE IF NOT EXISTS consultation_actes (
    consultation_id INTEGER REFERENCES consultations(id) ON DELETE CASCADE,
    acte_id INTEGER REFERENCES actes(id) ON DELETE CASCADE,
    PRIMARY KEY (consultation_id, acte_id)
);

-- Table: Observations Medicales
CREATE TABLE IF NOT EXISTS observations_medicales (
    id SERIAL PRIMARY KEY,
    contenu TEXT NOT NULL,
    date_observation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consultation_id INTEGER REFERENCES consultations(id) ON DELETE CASCADE
);

-- Table: Ordonnances
CREATE TABLE IF NOT EXISTS ordonnances (
    id SERIAL PRIMARY KEY,
    date_ordonnance TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consultation_id INTEGER REFERENCES consultations(id) ON DELETE CASCADE
);

-- Table: Lignes Ordonnance
CREATE TABLE IF NOT EXISTS lignes_ordonnance (
    id SERIAL PRIMARY KEY,
    medicament VARCHAR(255) NOT NULL,
    dosage VARCHAR(255),
    frequence VARCHAR(255),
    duree VARCHAR(255),
    ordonnance_id INTEGER REFERENCES ordonnances(id) ON DELETE CASCADE
);

-- Table: Paiements
CREATE TABLE IF NOT EXISTS paiements (
    id SERIAL PRIMARY KEY,
    montant DECIMAL(10, 2) NOT NULL,
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mode_paiement VARCHAR(50), -- CASH, CARD, etc.
    consultation_id INTEGER REFERENCES consultations(id) ON DELETE CASCADE
);

-- Table: Documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- SCAN, X-RAY, etc.
    chemin VARCHAR(500) NOT NULL,
    consultation_id INTEGER REFERENCES consultations(id) ON DELETE CASCADE,
    dossier_id INTEGER REFERENCES dossiers_medicaux(id) ON DELETE CASCADE
);

INSERT INTO actes (description, prix) VALUES 
('Consultation simple', 200.00),
('Extraction dentaire', 500.00),
('Détartrage', 300.00),
('Plombage', 400.00);

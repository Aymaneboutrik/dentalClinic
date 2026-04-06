-- 🔹 Types ENUM

CREATE TYPE etat_ligne_commande AS ENUM (
    'NonAjoutee',
    'Ajoutee'
);

CREATE TYPE order_status AS ENUM (
    'EnAttente',
    'Validee',
    'Refusee',
    'ModificationExigee'
);

CREATE TYPE type_mouvement AS ENUM (
    'Entree',
    'Sortie',
    'Modifiee'
);

-- 🔹 Création de la table fournisseur
CREATE TABLE IF NOT EXISTS fournisseur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse TEXT,
    telephone VARCHAR(20)
);

-- 🔹 Création de la table commande
CREATE TABLE IF NOT EXISTS commande (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT now(),
    statut order_status NOT NULL DEFAULT 'EnAttente'
    -- EnAttente = valeur par défaut
);

-- 🔹 Création de la table ligne_commande
CREATE TABLE IF NOT EXISTS ligne_commande (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire NUMERIC(10,2) NOT NULL,
    sous_total NUMERIC(10,2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
    commande_id INT NOT NULL,
    etat etat_ligne_commande NOT NULL DEFAULT 'NonAjoutee',
    CONSTRAINT fk_commande FOREIGN KEY(commande_id)
        REFERENCES commande(id) ON DELETE CASCADE
);

-- 🔹 Création de la table produit
CREATE TABLE IF NOT EXISTS produit (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    quantite INT NOT NULL,
    seuil_alerte INT NOT NULL,
    date_peremption DATE NOT NULL
);

-- 🔹 Création de la table mouvement_stock
CREATE TABLE IF NOT EXISTS mouvement_stock (
    id SERIAL PRIMARY KEY,
    type_mouvement type_mouvement NOT NULL,
    quantite INT NOT NULL,
    date_mouvement TIMESTAMP NULL,

    produit_id INT NULL,
    commande_id INT NULL,

    CONSTRAINT fk_mouvement_produit FOREIGN KEY (produit_id)
        REFERENCES produit(id) ON DELETE SET NULL,

    CONSTRAINT fk_mouvement_commande FOREIGN KEY (commande_id)
        REFERENCES commande(id) ON DELETE SET NULL
);

-- 🔹 Création de la table sortie
CREATE TABLE IF NOT EXISTS sortie (
    id SERIAL PRIMARY KEY,
    date_sortie TIMESTAMP NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL,

    CONSTRAINT fk_sortie_produit FOREIGN KEY (produit_id)
        REFERENCES produit(id) ON DELETE CASCADE
);

-- 🔹 Création de la table commande_validation
CREATE TABLE IF NOT EXISTS commande_validation (
    id INT PRIMARY KEY, -- = id de la commande
    type_action VARCHAR(30) NOT NULL,
    commentaire TEXT DEFAULT 'à saisir',
    date_validation TIMESTAMP NULL,

    CONSTRAINT fk_validation_commande FOREIGN KEY (id)
        REFERENCES commande(id) ON DELETE CASCADE
);

-- 🔹 Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_commande_date ON commande(date);
CREATE INDEX IF NOT EXISTS idx_produit_nom ON produit(nom);
CREATE INDEX IF NOT EXISTS idx_fournisseur_nom ON fournisseur(nom);

-- 🔹 Index pour optimiser les recherches sur mouvement_stock
CREATE INDEX IF NOT EXISTS idx_mouvement_produit ON mouvement_stock(produit_id);
CREATE INDEX IF NOT EXISTS idx_mouvement_commande ON mouvement_stock(commande_id);
CREATE INDEX IF NOT EXISTS idx_mouvement_date ON mouvement_stock(date_mouvement);

-- 🔹 Index pour optimiser les recherches sur sortie
CREATE INDEX IF NOT EXISTS idx_sortie_produit ON sortie(produit_id);
CREATE INDEX IF NOT EXISTS idx_sortie_date ON sortie(date_sortie);
CREATE INDEX IF NOT EXISTS idx_sortie_quantite ON sortie(quantite);

-- 🔹 Index pour optimiser les recherches sur commande_validation
CREATE INDEX IF NOT EXISTS idx_validation_commande ON commande_validation(id);  -- FK
CREATE INDEX IF NOT EXISTS idx_validation_type_action ON commande_validation(type_action);
CREATE INDEX IF NOT EXISTS idx_validation_date ON commande_validation(date_validation);
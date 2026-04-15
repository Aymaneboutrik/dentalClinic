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
    date TIMESTAMP NOT NULL,
    statut INT NOT NULL DEFAULT 0
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
    etat INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_commande FOREIGN KEY(commande_id)
        REFERENCES commande(id) ON DELETE CASCADE
);

-- 🔹 Création de la table produit
CREATE TABLE IF NOT EXISTS produit (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    quantite INT NOT NULL,
    seuil_alerte INT NOT NULL,
    date_peremption DATE NOT NULL
);

-- 🔹 Création de la table mouvement_stock
CREATE TABLE IF NOT EXISTS mouvement_stock (
    id SERIAL PRIMARY KEY,
    type_mouvement INT NOT NULL,
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

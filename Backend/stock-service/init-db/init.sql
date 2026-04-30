-- 🔹 Création de la table fournisseur
CREATE TABLE IF NOT EXISTS fournisseur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse TEXT,
    telephone VARCHAR(20)
);

-- 🔹 Création de la table produit
CREATE TABLE IF NOT EXISTS produit (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    quantite INT NOT NULL,
    seuil_alerte INT NOT NULL,
    date_peremption DATE NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT FALSE
);

-- 🔹 Création de la table commande
CREATE TABLE IF NOT EXISTS commande (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL,
    statut INT NOT NULL DEFAULT 0,
    fournisseur_id INT NOT NULL,

    CONSTRAINT fk_commande_fournisseur FOREIGN KEY(fournisseur_id)
        REFERENCES fournisseur(id) ON DELETE CASCADE
);

-- 🔹 Création de la table ligne_commande
CREATE TABLE IF NOT EXISTS ligne_commande (
    id SERIAL PRIMARY KEY,
    quantite INT NOT NULL,
    prix_unitaire NUMERIC(10,2) NOT NULL,
    commande_id INT NOT NULL,
    produit_id INT NOT NULL,

    CONSTRAINT fk_ligne_commande FOREIGN KEY(commande_id)
        REFERENCES commande(id) ON DELETE CASCADE,
    CONSTRAINT fk_ligne_produit FOREIGN KEY(produit_id)
        REFERENCES produit(id) ON DELETE RESTRICT
);

-- 🔹 Création de la table mouvement_stock
CREATE TABLE IF NOT EXISTS mouvement_stock (
    id SERIAL PRIMARY KEY,
    type_mouvement INT NOT NULL, -- 0: Entree, 1: Sortie
    quantite INT NOT NULL,
    date_mouvement TIMESTAMP NOT NULL,

    produit_id INT NULL,
    ligne_commande_id INT NULL,

    CONSTRAINT fk_mouvement_produit FOREIGN KEY (produit_id)
        REFERENCES produit(id) ON DELETE SET NULL,

    CONSTRAINT fk_mouvement_ligne FOREIGN KEY (ligne_commande_id)
        REFERENCES ligne_commande(id) ON DELETE SET NULL
);

-- 🔹 Création de la table commande_validation
CREATE TABLE IF NOT EXISTS commande_validation (
    id SERIAL PRIMARY KEY,
    commande_id INT NOT NULL UNIQUE,
    type_action VARCHAR(20) NOT NULL,
    commentaire TEXT,
    date_validation TIMESTAMP NOT NULL,

    CONSTRAINT fk_validation_commande FOREIGN KEY(commande_id)
        REFERENCES commande(id) ON DELETE CASCADE
);

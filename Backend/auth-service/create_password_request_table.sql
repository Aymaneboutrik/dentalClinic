-- SQL script to create the missing password_request table
CREATE TABLE IF NOT EXISTS password_request (
    id SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

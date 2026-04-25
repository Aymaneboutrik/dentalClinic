# 🏥 Paiement API — Microservice Facturation & Paiement

API REST Spring Boot pour la gestion des factures médicales, paiements, actes médicaux, remises et transactions.

---

## 🗂️ Structure du projet

```
projet-facturation/
├── paiement-api/               # Application Spring Boot
│   ├── src/
│   │   ├── main/java/com/facturation/paiement/
│   │   │   ├── models/         # Entités JPA
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── mappers/        # MapStruct mappers
│   │   │   ├── controllers/    # REST Controllers (MVC)
│   │   │   ├── services/       # Logique métier
│   │   │   ├── repository/
│   │   │   │   ├── interfaces/ # Contrats (abstraction)
│   │   │   │   └── impl/       # JPA + Adaptateurs
│   │   │   ├── enums/          # ModePaiement, StatutPaiement, TypeRemise
│   │   │   ├── exceptions/     # RemiseException, ResourceNotFoundException
│   │   │   ├── notifications/  # NotificationService (alertes critiques)
│   │   │   ├── config/         # AppDbContext
│   │   │   └── MainTransactionDemo.java  # Démo transaction (profil "demo")
│   │   └── test/               # Tests unitaires Mockito + JUnit 5
│   ├── Dockerfile
│   └── pom.xml
├── init-db/
│   └── init.sql                # Script SQL PostgreSQL
├── docker-compose.yml
└── README.md
```

---

## 🚀 Lancement avec Docker

```bash
docker compose up --build
```

L'API sera disponible sur : **http://localhost:5001**

---

## 📡 Endpoints REST

### Factures
| Méthode | URL                    | Description              |
|---------|------------------------|--------------------------|
| POST    | /api/factures          | Créer une facture        |
| GET     | /api/factures          | Lister toutes            |
| GET     | /api/factures/{id}     | Obtenir par ID           |
| PUT     | /api/factures/{id}     | Modifier                 |
| DELETE  | /api/factures/{id}     | Supprimer (+ actes médicaux en cascade) |

### Paiements
| Méthode | URL                              | Description              |
|---------|----------------------------------|--------------------------|
| POST    | /api/paiements                   | Enregistrer un paiement  |
| GET     | /api/paiements                   | Lister tous              |
| GET     | /api/paiements/{id}              | Obtenir par ID           |
| GET     | /api/paiements/facture/{id}      | Paiements d'une facture  |
| PUT     | /api/paiements/{id}              | Modifier                 |
| DELETE  | /api/paiements/{id}              | Supprimer                |

### Actes Médicaux
| Méthode | URL                                 | Description              |
|---------|-------------------------------------|--------------------------|
| POST    | /api/actes-medicaux                 | Créer un acte            |
| GET     | /api/actes-medicaux                 | Lister tous              |
| GET     | /api/actes-medicaux/{id}            | Obtenir par ID           |
| GET     | /api/actes-medicaux/facture/{id}    | Actes d'une facture      |
| PUT     | /api/actes-medicaux/{id}            | Modifier                 |
| DELETE  | /api/actes-medicaux/{id}            | Supprimer                |

### Remises
| Méthode | URL                          | Description              |
|---------|------------------------------|--------------------------|
| POST    | /api/remises                 | Appliquer une remise     |
| GET     | /api/remises                 | Lister toutes            |
| GET     | /api/remises/{id}            | Obtenir par ID           |
| GET     | /api/remises/facture/{id}    | Remises d'une facture    |
| PUT     | /api/remises/{id}            | Modifier                 |
| DELETE  | /api/remises/{id}            | Supprimer                |

### Transactions
| Méthode | URL                             | Description              |
|---------|---------------------------------|--------------------------|
| GET     | /api/transactions               | Lister toutes            |
| GET     | /api/transactions/{id}          | Obtenir par ID           |
| GET     | /api/transactions/remise/{id}   | Transactions d'une remise|
| PUT     | /api/transactions/{id}          | Modifier                 |
| DELETE  | /api/transactions/{id}          | Supprimer                |

---

## 🗃️ Règles métier importantes

- **Cascade DELETE** : Supprimer une facture supprime automatiquement ses actes médicaux.
- **Pas de cascade** entre Facture ↔ Paiement et Facture ↔ Remise.
- **Paiement IMPAYÉ** → alerte critique loggée automatiquement.
- **Remise** : `calculerMontant(total)` → FIXE retourne `valeur`, VARIABLE retourne `total * valeur / 100`.
- **Transaction** : Chaque calcul de remise trace automatiquement une ligne en base.
- **RemiseException** levée si montantApres ≤ 0 ou montantAvant ≤ 0.

---

## 🧪 Lancer les tests

```bash
cd paiement-api
mvn test
```

---

## 🔧 Variables d'environnement Docker

| Variable                         | Valeur par défaut                                   |
|----------------------------------|-----------------------------------------------------|
| SPRING_DATASOURCE_URL            | jdbc:postgresql://paiement-db:5432/paiementdb       |
| SPRING_DATASOURCE_USERNAME       | admin                                               |
| SPRING_DATASOURCE_PASSWORD       | admin123                                            |
| SPRING_JPA_HIBERNATE_DDL_AUTO    | validate                                            |

---

## 🏗️ Technologies

- **Java 17** + **Spring Boot 3.2**
- **Spring Data JPA** + **Hibernate**
- **PostgreSQL 16**
- **MapStruct** (mapping DTO ↔ Entity)
- **Lombok**
- **JUnit 5** + **Mockito**
- **Docker** + **Docker Compose**




## 🏗 Architecture du Service

Le module **Service Personnel** a été développé en suivant une architecture en couches afin d'assurer une bonne séparation des responsabilités et faciliter la maintenabilité du projet.

Architecture appliquée :

Controller → Service → Repository → DbContext → Base de données

Chaque couche possède un rôle spécifique :

- **Controller** : reçoit les requêtes HTTP et retourne les réponses.
- **Service** : contient la logique métier et les règles fonctionnelles.
- **Repository** : gère l'accès aux données.
- **DbContext** : représente la connexion avec la base PostgreSQL via Entity Framework Core.

Cette architecture permet un code plus clair, testable et évolutif.

---

## 📁 Organisation du Projet

Le projet est structuré en plusieurs dossiers :

- **Controllers/** : endpoints de l'API
- **Services/** : logique métier
- **Repositories/** : accès aux données
- **Models/** : entités de la base
- **DTOs/** : objets de transfert de données
- **Mappers/** : conversion DTO ↔ Entity
- **Data/** : configuration du DbContext
- **Exceptions/** : gestion des erreurs personnalisées
- **Enums/** : énumérations métier

Cette organisation facilite la maintenance et l'évolution du projet.

---

## 📦 Utilisation des DTOs

Les **DTOs** sont utilisés pour transporter les données entre le client et l'API.

Exemple :

CreateEmployeeRequestDto

Ce DTO permet de recevoir les informations nécessaires à la création d'un employé tout en protégeant les entités internes de l'application.

Les données sont validées à l'aide des **DataAnnotations**.

---

## 🧠 Logique Métier

La logique métier est implémentée dans la couche **Service**.

Lors de la création d'un employé, plusieurs règles sont appliquées :

- vérification que l'email n'existe pas déjà
- vérification que le rôle existe dans la base de données
- application d'un statut par défaut pour l'employé

Ces règles sont centralisées dans la couche Service afin de garder les controllers simples.

---

## 🧱 Repository Pattern

Le **Repository Pattern** est utilisé pour isoler l'accès aux données.

Deux composants principaux ont été créés :

- IEmployeeRepository
- EmployeeRepository

Le repository est responsable de l'interaction avec la base de données via **Entity Framework Core**.

---

## 🧵 Programmation Asynchrone

Les opérations de base de données utilisent des **méthodes asynchrones**.

Exemples :

- AnyAsync()
- AddAsync()
- SaveChangesAsync()

L'utilisation de l'asynchrone permet :

- d'améliorer les performances
- de mieux gérer les requêtes concurrentes
- d'éviter le blocage des threads

---

## 🔐 Gestion Globale des Exceptions

Une stratégie de **gestion centralisée des erreurs** a été mise en place.

Une exception personnalisée a été créée :

Exceptions/ApiException.cs

Cette exception permet de représenter les erreurs métier comme :

- email déjà utilisé
- rôle inexistant

Les exceptions sont interceptées par un **middleware global** configuré dans `Program.cs`.

Ce middleware :

- capture les exceptions
- génère une réponse JSON standardisée
- renvoie la réponse au client

Cette approche permet d'éviter l'utilisation de try/catch dans les controllers.

---

## 🔢 Utilisation des Enums

Une énumération a été introduite pour gérer le **statut de l'employé**.

Exemple :

StatutEmploye :

- Actif
- Inactif

L'utilisation d'un enum permet de contrôler les valeurs possibles et d'éviter les erreurs de saisie.

---

## 🌐 Communication API

L'API expose des endpoints REST permettant d'interagir avec le système.

Exemple :

POST /api/employees

Cette requête permet de créer un nouvel employé en appliquant les règles métier définies dans la couche Service.

Les réponses de l'API sont retournées au format **JSON** et respectent les standards HTTP.

---

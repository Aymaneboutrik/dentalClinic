# 🦷 Gestion de Cabinet Dentaire – Architecture Microservices

Plateforme complète de gestion d'un cabinet dentaire, conçue selon une architecture **microservices** : patients, rendez-vous, employés, facturation, stock et laboratoire partenaire.

> Projet de fin d'année – EHEI Oujda

---

## 📖 Présentation

- Application web destinée à digitaliser et centraliser la gestion quotidienne d'un cabinet dentaire.
- Architecture microservices : chaque domaine métier est un service indépendant, avec sa propre base de données.
- Communication entre services via **API REST**.
- Accès centralisé par une **API Gateway (Nginx)**.
- Tous les services sont **conteneurisés** avec Docker et orchestrés avec Docker Compose.

---

## ✨ Fonctionnalités

- 👤 **Patients** : création, consultation, modification et suivi des dossiers patients.
- 📅 **Rendez-vous** : planification, modification et annulation des rendez-vous.
- 👩‍⚕️ **Employés** : gestion du personnel du cabinet.
- 💳 **Facturation** : génération et suivi des factures et paiements.
- 📦 **Stock** : gestion du matériel et des consommables.
- 🧪 **Laboratoire partenaire** : gestion des échanges et des commandes avec le laboratoire.
- 🔐 **Authentification** : connexion sécurisée et gestion des rôles avec JWT.

---

## 🏗️ Architecture

- **Frontend React.js** : interface utilisateur, appels API vers la gateway.
- **API Gateway (Nginx)** : point d'entrée unique, routage des requêtes et contrôle d'accès.
- **Microservices** : Patients, Rendez-vous, Employés, Facturation, Stock, Laboratoire.
- **Bases de données PostgreSQL** : une base par service (bases distribuées).
- Le frontend n'appelle jamais directement les services : tout passe par la gateway.

---

## 🛠️ Technologies utilisées

- **Backend** : ASP.NET Core, Spring Boot
- **Frontend** : React.js
- **Base de données** : PostgreSQL
- **Communication inter-services** : API REST
- **Sécurité** : JWT
- **API Gateway / Reverse proxy** : Nginx
- **Conteneurisation** : Docker, Docker Compose
- **Tests** : tests unitaires, tests end-to-end (E2E)

---



## 🚀 Lancement du projet

- **Prérequis** : Docker et Docker Compose installés.
- Cloner le dépôt, puis lancer l'ensemble des services avec Docker Compose.
- Tous les services (frontend, gateway, microservices, bases PostgreSQL) démarrent ensemble.
- Une fois lancé, l'application est accessible via la gateway Nginx.

---

## 🔐 Sécurité

- Authentification et autorisation par **JWT**.
- Accès aux services contrôlé au niveau de l'**API Gateway Nginx**.
- Services non exposés directement : accessibles uniquement via la gateway.

---

## 🧪 Tests

Pour garantir la **qualité, la stabilité et la robustesse** des microservices, deux niveaux de tests ont été réalisés.

### Tests unitaires

- Vérification de chaque composant de manière isolée (logique métier, services, contrôleurs).
- Réalisés sur les microservices **ASP.NET Core** et **Spring Boot**.
- Détection rapide des régressions lors des évolutions du code.

### Tests end-to-end (E2E)

- Simulation de scénarios utilisateur complets : frontend → gateway → microservices → base de données.
- Validation du bon fonctionnement global de la plateforme.
- Scénarios couverts :
  - authentification
  - gestion des patients
  - prise de rendez-vous
  - facturation

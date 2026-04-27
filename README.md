# Projet Nest.js : Gestionnaire de Tournois de

# Jeux Vidéo

## Lancement rapide (Docker)

```bash
docker compose up -d
```

Services disponibles :

- API Nest.js : `http://localhost:3000`
- PostgreSQL : `localhost:5432`
- Adminer : `http://localhost:8080`

Connexion Adminer :

- Système : `PostgreSQL`
- Serveur : `db`
- Utilisateur : `postgres`
- Mot de passe : `postgres`
- Base de données : `tournaments_db`

## Objectif du projet

#### Développer une API REST permettant de gérer des tournois de jeux

#### vidéo. Cette application permettra aux utilisateurs de créer des tournois,

#### de s'y inscrire, de gérer les matchs et de suivre les résultats en temps

#### réel.

## Fonctionnalités attendues

## Structure de base

## Entités et validation

## Phase 3 : Authentification et sécurité

#### Création d'un nouveau projet Nest.js avec Docker Compose ✅

#### Structure en modules, contrôleurs et services

#### Configuration d'une base de données PostgreSQL via Docker ✅

#### Compose

#### Points d'entrée HTTP de base pour la gestion des entités

#### 🟢 Création des entités Tournament, Player, Match et Game via ✅

#### TypeORM ✅

#### Implémentation de la validation des données avec class-validator ✅

#### Relations entre les entités (One-to-Many, Many-to-Many) ✅

#### Opérations CRUD complètes pour chaque entité ✅

#### Implémentation de l'authentification JWT avec Passport

#### Guards pour protéger les routes sensibles ✅

#### Interceptors pour transformer les réponses ✅

#### Pipes pour la validation et transformation des données


### Phase 4 : Déploiement

## Entités du domaine

### Tournament (Tournoi)

### Player

### Match

#### Dockerfile optimisé pour la production

#### Image Docker fonctionnelle et déployable

##### {

```
id: string;
name: string;
game: string;
maxPlayers: number;
startDate: Date;
status: 'pending' | 'in_progress' | 'completed';
createdAt: Date;
}
```
##### {

```
id: string;
username: string;
email: string;
password: string;
avatar: string;
createdAt: Date;
}
```
##### {

```
id: string;
tournamentId: string;
player1Id: string;
player2Id: string;
winnerId: string | null;
```

### Game

## Routes HTTP attendues

### Authentication

### Tournaments

### Players

```
score: string;
round: number;
status: 'pending' | 'in_progress' | 'completed';
}
```
##### {

```
id: string;
name: string;
publisher: string;
releaseDate: Date;
genre: string;
}
```
#### POST /auth/register - Inscription d'un joueur

#### POST /auth/login - Connexion et récupération du JWT

#### GET /tournaments - Liste des tournois (filtrable par statut) ✅

#### POST /tournaments - Création d'un tournoi (authentifié) ✅

#### GET /tournaments/:id - Détails d'un tournoi ✅

#### PUT /tournaments/:id - Modification d'un tournoi (authentifié) ✅

#### DELETE /tournaments/:id - Suppression d'un tournoi (authentifié) ✅

#### POST /tournaments/:id/join - Inscription à un tournoi (authentifié) ✅

#### GET /players - Liste des joueurs

#### GET /players/:id - Profil d'un joueur

#### GET /players/:id/tournaments - Tournois participés par un joueur


### Matches

### Games

## Exigences techniques

## Malus

#### GET /tournaments/:id/matches - Liste des matchs d'un tournoi

#### POST /matches/:id/result - Soumettre un résultat (authentifié)

#### GET /games - Liste des jeux

#### POST /games - Ajouter un jeu (authentifié, admin)

#### Utilisation de TypeScript en mode strict

#### Utilisation de Docker obligatoire

#### Deux environnement docker (dev & prod)

#### 🟢 Base de données PostgreSQL avec TypeORM ✅

#### Validation des données entrantes ✅

#### Authentification JWT fonctionnelle

#### Code propre et structuré selon l'architecture Nest.js

#### Dockerfile fonctionnel pour le déploiement

#### README.md avec les instructions d'installation et d'utilisation

#### Test d'intégration obligatoire pour toutes les routes

#### Pas de lint, ou le code contient des erreurs d'analyse de code statique

#### Pas de bases de données, ou différentes de PostgreSQL

#### TypeORM absent du projet

#### Les routes ne valident pas les données reçues

#### L'authentification n'est pas fonctionnelle ou est bugguée

#### Le projet ne démarre pas malgré les instructions

#### Le README ne contient pas les instructions exhaustive pour lancer le

#### projet

#### Un service externe est utilisé (Render, DynamoDB, ...)

#### Pas de malus pour l'intelligence artificielle


## Bonus (points supplémentaires)

## Barème de notation (sur 20 points)

### Partie fonctionnelle (15 points)

#### Critère Points Description

#### Structure du projet 2 pts Utilisation correcte des modules,

#### contrôleurs et services

#### Modèle de données 2 pts Entités bien définies avec relations

#### TypeORM

#### CRUD complet 2 pts Opérations Create, Read, Update,

#### Delete fonctionnelles

#### Validation des

#### données

#### 1.5 pts Utilisation de class-validator et des DTOs

#### Base de données 2 pts Persistence fonctionnelle avec

#### PostgreSQL/TypeORM

#### Authentification 2 pts JWT fonctionnel avec Guards

#### Interceptors 1 pt Transformation correcte des réponses

#### Pipes 1 pt Validation et transformation des

#### paramètres

#### Dockerfile 1 pt Image Docker fonctionnelle et optimisée

#### Code quality 0.5 pts Code propre, typé et maintenable

### Bonus (5 points maximum)

#### 1. WebSocket en temps réel (+1 point) : Notifications lors des

#### changements de statut des tournois

#### 2. Système de brackets (+1.5 points) : Génération automatique des

#### brackets pour les tournois

#### 3. Statistiques avancées (+1 point) : Classements, statistiques par

#### joueur

#### 4. Documentation API (+1 point) : Documentation Swagger/OpenAPI

#### 5. Microservices (+1 point) : Avec le module @nestjs/microservices


#### Bonus Points Description

#### WebSocket 1 pt Temps réel

#### Brackets 1.5 pts Génération automatique

#### Statistiques 1 pt Classements avancés

#### Documentation 1 pt Swagger/OpenAPI

#### Tests 0.5 pt/module Tests unitaires
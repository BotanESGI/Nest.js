# API Tournois Nest.js (JWT + PostgreSQL + Docker)

API REST de gestion de tournois avec authentification JWT via Passport, validation stricte des entrées, base PostgreSQL (TypeORM) et environnements Docker `dev` et `prod`.

## Stack technique

- Nest.js + TypeScript (`strict: true`)
- Authentification: `@nestjs/passport`, `passport-jwt`, `@nestjs/jwt`
- Base de données: PostgreSQL + TypeORM
- Validation: `class-validator` + `ValidationPipe` globale
- Tests d’intégration: Jest + Supertest
- Conteneurisation: Docker + Docker Compose

## Variables d’environnement

Le projet lit les variables depuis `.env` (ou `.env.example` par défaut).

```env
PORT=3000
NODE_ENV=development
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tournaments_db
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=1d
```

## Lancement en développement (Docker)

```bash
docker compose up --build -d
```

Services disponibles:

- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Adminer: `http://localhost:8081`

Arrêter l’environnement dev:

```bash
docker compose down
```

## Lancement en production (Docker)

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Cet environnement utilise le `Dockerfile` de production (build multi-stage).

Arrêter l’environnement prod:

```bash
docker compose -f docker-compose.prod.yml down
```

## Lancement local (sans Docker)

Prérequis: PostgreSQL local disponible.

```bash
npm ci
npm run start:dev
```

## Qualité et tests

```bash
npm run lint
npm run build
npm run test:e2e
```

Les tests d’intégration couvrent toutes les routes exposées:

- `POST /auth/register`
- `POST /auth/login`
- `GET /tournaments`
- `GET /tournaments/:id`
- `POST /tournaments`
- `PUT /tournaments/:id`
- `DELETE /tournaments/:id`
- `POST /tournaments/:id/join`
- `GET /games`
- `POST /games`

## Authentification JWT

### Inscription

`POST /auth/register`

```json
{
  "username": "user",
  "email": "user@example.com",
  "password": "VeryStrongPass1"
}
```

### Connexion

`POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "VeryStrongPass1"
}
```

Réponse (register/login):

```json
{
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": "1d",
    "user": {
      "id": "uuid",
      "username": "user",
      "email": "user@example.com"
    }
  }
}
```

### Utiliser le token

Ajouter l’en-tête HTTP sur les routes protégées:

```http
Authorization: Bearer <jwt>
```

Le premier utilisateur inscrit reçoit automatiquement le rôle `admin`, les suivants le rôle `user`.
Si la base contient déjà des utilisateurs (volume Docker persistant), un nouveau compte ne sera pas `admin`.

## Routes Tournois

- `GET /tournaments` (filtre optionnel `status`)
- `GET /tournaments/:id`
- `POST /tournaments` (protégée JWT)
- `PUT /tournaments/:id` (protégée JWT)
- `DELETE /tournaments/:id` (protégée JWT)
- `POST /tournaments/:id/join` (protégée JWT)

Exemple de création:

```json
{
  "name": "Spring Cup",
  "maxPlayers": 16,
  "startDate": "2026-05-10T18:00:00.000Z",
  "status": "pending",
  "gameId": "ea4140da-ba9e-4181-a6b8-df0776b1f59c"
}
```

## Routes Games

- `GET /games` (publique)
- `POST /games` (protégée JWT + rôle admin)

Exemple de création:

```json
{
  "name": "Counter Strike 2",
  "publisher": "Valve",
  "releaseDate": "2023-09-27",
  "genre": "FPS"
}
```

## Scénario de test manuel (games + rôles)

### 1) Redémarrer proprement l'environnement

```bash
docker compose down -v
docker compose up --build -d
```

### 2) Créer le premier utilisateur (admin attendu)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"admin1",
    "email":"admin1@example.com",
    "password":"VeryStrongPass1"
  }'
```

Vérifier dans la réponse: `data.user.role = "admin"`.

### 3) Créer le second utilisateur (user attendu)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"user1",
    "email":"user1@example.com",
    "password":"VeryStrongPass1"
  }'
```

Vérifier dans la réponse: `data.user.role = "user"`.

### 4) Tester les routes games

- `GET /games` sans token -> `200`
- `POST /games` sans token -> `401`
- `POST /games` avec token `user` -> `403`
- `POST /games` avec token `admin` -> `201`

Exemple payload:

```json
{
  "name": "Counter Strike 2",
  "publisher": "Valve",
  "releaseDate": "2023-09-27",
  "genre": "FPS"
}
```

### 5) Tester la validation DTO

Avec un token admin, envoyer un payload invalide (champs vides / date invalide) sur `POST /games` -> `400`.

## Architecture

- `src/auth`: module d’authentification (controller, service, stratégie JWT)
- `src/tournaments`: routes métier tournois
- `src/games`: routes métier jeux
- `src/database/entities`: entités TypeORM
- `src/common`: guards JWT/admin et interceptor de transformation des réponses

## Remarques

- La validation des payloads est globale (`whitelist`, `forbidNonWhitelisted`, `transform`).
- En production, `synchronize` TypeORM est désactivé automatiquement.

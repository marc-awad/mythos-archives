## ✨ Mises à jour depuis la présentation intermédiaire

### Niveau 13/20 ✅

- ✅ Calcul automatique du `legendScore` pour chaque créature
- ✅ Tri des créatures par `legendScore`
- ✅ Système de réputation complet (+3/-1/+1 bonus)
- ✅ Promotion automatique USER → EXPERT à 10 points

### Niveau 16/20 ✅

- ✅ **mythology-service** : 3ème microservice avec stats et classification
- ✅ Classification mythologique par familles
- ✅ Soft delete des témoignages (`deletedAt`)
- ✅ Système d'historisation (`ModerationLog`)

### Niveau 18-20/20 ✅

- ✅ Dockerisation complète (Dockerfiles + docker-compose)
- ✅ Pipeline CI/CD (GitHub Actions)
- ✅ Correction linting sur tous les microservices
- ✅ Documentation Swagger/OpenAPI (auth-service + lore-service)
- ✅ Diagramme d'architecture du système
- ✅ README détaillé avec instructions

**Niveau atteint : 18-20/20**

---

# Mythos Archives 🐉

Plateforme collaborative de recensement de créatures mythologiques imaginaires où les utilisateurs soumettent des témoignages validés par des experts, créant ainsi un bestiaire évolutif.

## 📋 Description

Mythos Archives permet aux utilisateurs de :

- Répertorier des créatures mythologiques fictives
- Soumettre des témoignages sur ces créatures
- Faire valider ou rejeter les témoignages par des experts
- Voir les créatures évoluer en fonction des témoignages validés

## 🏗️ Architecture

Le projet suit une architecture microservices :

- **auth-service** (Port 3001) : Gestion de l'authentification et des utilisateurs (Express + Prisma + SQLite)
- **lore-service** (Port 3002) : Gestion du bestiaire et des témoignages (Express + Mongoose + MongoDB)

## 🛠️ Stack Technique

- **Backend** : Node.js (v22.20.0) + Express.js + TypeScript
- **Bases de données** :
  - SQLite avec Prisma (auth-service)
  - MongoDB avec Mongoose (lore-service)
- **Authentification** : JWT + système de rôles (USER, EXPERT, ADMIN)
- **Documentation** : Tests via Postman

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** : v22.20.0 ou supérieur ([Télécharger](https://nodejs.org/))
- **MongoDB** : Version 6.0+ ([Installation](https://www.mongodb.com/try/download/community))
- **Git** : Pour cloner le repository
- **Postman** : Pour tester l'API (optionnel)

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/marc-awad/mythos-archives.git
cd mythos-archives
```

### 2. Configuration de auth-service

```bash
cd auth-service
npm install
```

Créez un fichier `.env` à la racine de `auth-service` :

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET=votre_secret_jwt_super_securise_ici
JWT_EXPIRES_IN=7d

# Server
PORT=3001
```

Initialisez la base de données Prisma :

```bash
npx prisma migrate dev --name init
```

### 3. Configuration de lore-service

```bash
cd ../lore-service
npm install
```

Créez un fichier `.env` à la racine de `lore-service` :

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/mythos-lore

# Auth Service
AUTH_SERVICE_URL=http://localhost:3001

# Server
PORT=3002
```

**Important** : Assurez-vous que MongoDB est en cours d'exécution sur votre machine.

## ▶️ Lancement des services

### Démarrer MongoDB (si pas déjà lancé)

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### Lancer auth-service

Dans un premier terminal :

```bash
cd auth-service
npm run dev
```

Le service démarre sur `http://localhost:3001`

### Lancer lore-service

Dans un second terminal :

```bash
cd lore-service
npm run dev
```

Le service démarre sur `http://localhost:3002`

## 🧪 Tester l'API

### Endpoints auth-service (Port 3001)

**Authentification**

- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter
- `GET /auth/me` - Obtenir ses informations (JWT requis)

**Administration**

- `GET /admin/users` - Lister tous les utilisateurs (ADMIN uniquement)
- `PATCH /users/:id/role` - Modifier le rôle d'un utilisateur (ADMIN uniquement)

### Endpoints lore-service (Port 3002)

**Créatures**

- `POST /creatures` - Créer une créature (JWT requis)
- `GET /creatures` - Lister toutes les créatures
- `GET /creatures/:id` - Obtenir une créature spécifique

**Témoignages**

- `POST /testimonies` - Soumettre un témoignage (JWT requis)
- `GET /creatures/:id/testimonies` - Lister les témoignages d'une créature
- `POST /testimonies/:id/validate` - Valider un témoignage (EXPERT/ADMIN uniquement)
- `POST /testimonies/:id/reject` - Rejeter un témoignage (EXPERT/ADMIN uniquement)

### Exemple d'utilisation avec Postman

1. **S'inscrire** : `POST http://localhost:3001/auth/register`

```json
{
  "email": "user@example.com",
  "username": "testuser",
  "password": "password123"
}
```

2. **Se connecter** : `POST http://localhost:3001/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

3. **Créer une créature** : `POST http://localhost:3002/creatures`
   - Header : `Authorization: Bearer <votre_token_jwt>`

```json
{
  "name": "Dragon des Glaces",
  "origin": "Nordique"
}
```

4. **Soumettre un témoignage** : `POST http://localhost:3002/testimonies`
   - Header : `Authorization: Bearer <votre_token_jwt>`

```json
{
  "creatureId": "id_de_la_creature",
  "description": "J'ai aperçu cette créature près d'un lac gelé..."
}
```

## 👥 Système de Rôles

- **USER** : Peut créer des créatures et soumettre des témoignages
- **EXPERT** : Peut valider/rejeter les témoignages + droits USER
- **ADMIN** : Accès complet à toutes les fonctionnalités

## 📝 Règles Métier

- ❌ Un utilisateur ne peut pas valider son propre témoignage
- ⏱️ Impossible de soumettre deux témoignages sur la même créature en moins de 5 minutes
- 🔒 Les noms de créatures doivent être uniques
- 📄 La description d'un témoignage est obligatoire
- 🔐 JWT requis pour toutes les opérations utilisateur

## 📂 Structure du Projet

```
mythos-archives/
├── auth-service/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
│
├── lore-service/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── package.json
│
└── README.md
```

## 🎯 Statut du Projet

**Niveau actuel** : 10/20 ✅

Fonctionnalités implémentées :

- ✅ Authentification complète (register, login, JWT)
- ✅ Système de rôles (USER, EXPERT, ADMIN)
- ✅ Gestion des créatures (CRUD)
- ✅ Gestion des témoignages (création, consultation)
- ✅ Validation/rejet des témoignages par EXPERT/ADMIN
- ✅ Communication entre microservices (vérification JWT)

**Prochaines étapes** : Niveau 13/20

- ⏳ Indice de légende automatique (legendScore)
- ⏳ Système de réputation
- ⏳ Promotion automatique USER → EXPERT

## 👨‍💻 Contributeurs

- Marc AWAD

## 📄 Licence

Projet académique - SUP DE VINCI

---

**Note** : Ce projet est réalisé dans le cadre d'un exercice backend. Aucun frontend n'est fourni, l'interaction se fait via Postman ou équivalent.

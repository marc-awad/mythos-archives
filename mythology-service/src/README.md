# 🏛️ Mythology Service

Service d'analyse et de statistiques du bestiaire mythologique de **Mythos Archives**.

Ce microservice interroge le **lore-service** pour générer des statistiques globales sur les créatures et leurs témoignages.

---

## 📦 Stack Technique

- **Node.js** v22.20.0+
- **Express.js** - Framework web
- **TypeScript** - Typage statique
- **Axios** - Communication HTTP avec lore-service
- **JWT** - Authentification (relayé vers lore-service)

---

## 🚀 Installation

### 1. Cloner ou créer le dossier

```bash
cd mythos-archives
mkdir mythology-service
cd mythology-service
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Créer un fichier `.env` à la racine :

```env
PORT=3003
LORE_SERVICE_URL=http://localhost:3002
AUTH_SERVICE_URL=http://localhost:3001
NODE_ENV=development
```

---

## ▶️ Lancement

### Mode développement

```bash
npm run dev
```

Le service démarre sur `http://localhost:3003`

### Mode production

```bash
npm run build
npm start
```

---

## 📊 API Endpoints

### 🔹 GET /mythology/stats

Génère les statistiques globales du bestiaire.

**Authentification** : JWT requis (Bearer token)

**Headers** :

```
Authorization: Bearer <votre_token_jwt>
```

**Réponse réussie** (200) :

```json
{
  "success": true,
  "message": "Statistiques générées avec succès",
  "data": {
    "totalCreatures": 10,
    "averageTestimoniesPerCreature": 2.8,
    "totalTestimonies": 28,
    "totalValidatedTestimonies": 15,
    "totalPendingTestimonies": 8,
    "totalRejectedTestimonies": 5,
    "creatures": [
      {
        "id": "677e1234567890abcdef1234",
        "name": "Dragon des Glaces",
        "origin": "Nordique",
        "legendScore": 3.4,
        "totalTestimonies": 5,
        "validatedTestimonies": 3,
        "pendingTestimonies": 1,
        "rejectedTestimonies": 1
      },
      {
        "id": "677e1234567890abcdef5678",
        "name": "Phoenix de Sable",
        "origin": "Saharien",
        "legendScore": 2.2,
        "totalTestimonies": 3,
        "validatedTestimonies": 2,
        "pendingTestimonies": 0,
        "rejectedTestimonies": 1
      }
    ]
  }
}
```

**Erreurs possibles** :

- `401` - Token invalide ou manquant
- `503` - Lore-service indisponible
- `504` - Timeout

---

### 🔹 GET /health

Vérifier l'état du service (pas d'auth requise).

**Réponse** (200) :

```json
{
  "success": true,
  "message": "Mythology service is running",
  "timestamp": "2025-01-12T10:30:00.000Z"
}
```

---

## 🧪 Exemple d'utilisation avec Postman

### 1. S'authentifier (auth-service)

```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Copier le `token` de la réponse.**

---

### 2. Récupérer les statistiques

```http
GET http://localhost:3003/mythology/stats
Authorization: Bearer <votre_token_jwt>
```

---

## 🏗️ Architecture

```
mythology-service/
├── src/
│   ├── config/
│   │   └── index.ts              # Configuration (ports, URLs)
│   ├── controllers/
│   │   └── mythology.controller.ts  # Controller des stats
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # Vérification JWT
│   │   └── errorHandler.ts       # Gestion d'erreurs
│   ├── routes/
│   │   ├── index.ts              # Routes principales
│   │   └── mythology.routes.ts   # Routes /mythology
│   ├── services/
│   │   ├── lore.service.ts       # Client HTTP vers lore-service
│   │   └── mythology.service.ts  # Logique de calcul des stats
│   ├── types/
│   │   └── index.ts              # Types TypeScript
│   ├── app.ts                    # Configuration Express
│   └── server.ts                 # Point d'entrée
├── .env
├── .env.example
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📡 Communication inter-services

Le **mythology-service** communique avec le **lore-service** via HTTP :

```
┌──────────────────┐
│ Client (Postman) │
└────────┬─────────┘
         │ JWT
         ↓
┌──────────────────┐
│ mythology-service│
│  GET /stats      │
└────────┬─────────┘
         │ Relaye JWT
         ↓
┌──────────────────┐
│  lore-service    │
│  GET /creatures  │
│  GET /creatures/ │
│      :id/        │
│    testimonies   │
└──────────────────┘
```

**Important** : Le JWT est **relayé tel quel** au lore-service, qui le valide auprès du auth-service.

---

## 🔍 Fonctionnalités

### Statistiques calculées

- **Nombre total de créatures**
- **Moyenne de témoignages par créature**
- **Total de témoignages** (tous statuts confondus)
- **Total de témoignages validés**
- **Total de témoignages en attente**
- **Total de témoignages rejetés**

### Détail par créature

- **ID et nom**
- **Origine**
- **LegendScore** (indice de légende)
- **Nombre total de témoignages**
- **Nombre de témoignages validés**
- **Nombre de témoignages en attente**
- **Nombre de témoignages rejetés**

---

## ⚠️ Prérequis

Avant de lancer **mythology-service**, assure-toi que :

1. ✅ **auth-service** tourne sur le port 3001
2. ✅ **lore-service** tourne sur le port 3002
3. ✅ Tu as un **token JWT valide** (via `POST /auth/login`)

---

## 🐛 Dépannage

### Erreur "Impossible de contacter le lore-service"

```bash
# Vérifier que lore-service est lancé
curl http://localhost:3002/health
```

### Token invalide

```bash
# Obtenir un nouveau token
POST http://localhost:3001/auth/login
```

### Port déjà utilisé

```bash
# Changer le PORT dans .env
PORT=3004
```

---

## 📝 Scripts npm

```bash
npm run dev      # Lancer en mode développement
npm run build    # Compiler TypeScript
npm start        # Lancer en production
```

---

## 🎯 Statut du projet

**MYTH-1** : ✅ Implémenté

- ✅ Endpoint `GET /mythology/stats`
- ✅ Communication avec lore-service
- ✅ Relai du JWT
- ✅ Calcul des statistiques globales
- ✅ Architecture propre (routes/controllers/services)
- ✅ Gestion d'erreurs complète

---

## 👨‍💻 Développement

### Structure du code

- **Routes** : Définissent les endpoints
- **Controllers** : Gèrent les requêtes/réponses
- **Services** : Contiennent la logique métier
- **Middlewares** : Authentification, gestion d'erreurs

### Ajout d'un nouvel endpoint

1. Créer la route dans `routes/`
2. Créer le controller dans `controllers/`
3. Ajouter la logique dans `services/`
4. Mettre à jour le README

---

## 📄 Licence

Projet académique - SUP DE VINCI

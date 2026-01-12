# 🐳 Docker - Mythos Archives

## Prérequis

- Docker version 24.0 ou supérieure
- Docker Compose version 2.20 ou supérieure

Vérifier les versions installées :

```bash
docker --version
docker-compose --version
```

## 🚀 Démarrage rapide

### 1. Lancer tous les services

À la racine du projet :

```bash
docker-compose up
```

Ou en mode détaché (arrière-plan) :

```bash
docker-compose up -d
```

Cette commande va :

- Construire les images Docker pour chaque microservice
- Démarrer MongoDB
- Lancer les 3 microservices (auth, lore, mythology)
- Créer un réseau Docker commun pour la communication inter-services

### 2. Vérifier que tout fonctionne

```bash
docker-compose ps
```

Vous devriez voir 4 services en état `running` :

- `mythos-mongodb`
- `mythos-auth-service`
- `mythos-lore-service`
- `mythos-mythology-service`

### 3. Accéder aux services

- **Auth Service** : http://localhost:3001
- **Lore Service** : http://localhost:3002
- **Mythology Service** : http://localhost:3003
- **MongoDB** : localhost:27017

## 📋 Commandes utiles

### Arrêter les containers

```bash
docker-compose down
```

### Arrêter et supprimer les volumes (données)

⚠️ Cette commande supprime les données des bases de données :

```bash
docker-compose down -v
```

### Rebuilder les images

Après modification du code :

```bash
docker-compose up --build
```

Ou pour un service spécifique :

```bash
docker-compose up --build auth-service
```

### Voir les logs

Tous les services :

```bash
docker-compose logs -f
```

Un service spécifique :

```bash
docker-compose logs -f auth-service
```

### Exécuter des commandes dans un container

```bash
# Accéder au shell d'un service
docker-compose exec auth-service sh

# Exécuter une commande Prisma
docker-compose exec auth-service npx prisma studio

# Accéder à MongoDB
docker-compose exec mongodb mongosh
```

### Redémarrer un service

```bash
docker-compose restart auth-service
```

### Lister les volumes

```bash
docker volume ls | grep mythos
```

## 🔧 Gestion des bases de données

### SQLite (auth-service)

Les données SQLite sont persistées dans le volume `mythos-auth-db`.

Pour exécuter une migration Prisma :

```bash
docker-compose exec auth-service npx prisma migrate deploy
```

Pour ouvrir Prisma Studio :

```bash
docker-compose exec auth-service npx prisma studio
```

### MongoDB (lore-service)

Les données MongoDB sont persistées dans les volumes `mythos-mongodb-data` et `mythos-mongodb-config`.

Pour accéder au shell MongoDB :

```bash
docker-compose exec mongodb mongosh mythos_lore
```

## 🛠️ Mode développement

Les Dockerfiles utilisent un build multi-stage optimisé pour la production.

Pour le développement avec hot-reload, vous pouvez :

1. **Garder Docker pour les BDD uniquement** et lancer les services en local :

```bash
# Lancer uniquement MongoDB
docker-compose up mongodb

# Dans un autre terminal, lancer les services localement
cd auth-service && npm run dev
cd lore-service && npm run dev
cd mythology-service && npm run dev
```

2. **Ou modifier le docker-compose.yml** pour utiliser `npm run dev` au lieu de `node dist/...`

## 🔍 Healthchecks

Chaque service dispose d'un healthcheck. Vérifier l'état de santé :

```bash
docker-compose ps
```

Un service sain affichera `healthy` dans la colonne Status.

## 🐛 Dépannage

### Les services ne démarrent pas

1. Vérifier les logs :

```bash
docker-compose logs
```

2. Vérifier que les ports ne sont pas déjà utilisés :

```bash
# Windows PowerShell
netstat -ano | findstr "3001"
netstat -ano | findstr "3002"
netstat -ano | findstr "3003"
netstat -ano | findstr "27017"
```

3. Rebuilder les images :

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Erreurs de connexion entre services

Les services communiquent via le réseau Docker `mythos-network`. Vérifier que les URLs utilisent les noms de services :

- ✅ `http://auth-service:3001`
- ❌ `http://localhost:3001`

### Base de données corrompue

Supprimer les volumes et redémarrer :

```bash
docker-compose down -v
docker-compose up
```

⚠️ Cela supprime toutes les données !

## 📊 Architecture réseau

```
┌─────────────────────────────────────────────────────┐
│              mythos-network (bridge)                │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ auth-service │  │ lore-service │  │ mythology │ │
│  │   :3001      │◄─┤   :3002      │◄─┤  service  │ │
│  │   (SQLite)   │  │              │  │   :3003   │ │
│  └──────────────┘  └──────┬───────┘  └───────────┘ │
│                           │                         │
│                    ┌──────▼───────┐                │
│                    │   MongoDB    │                │
│                    │    :27017    │                │
│                    └──────────────┘                │
└─────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
     localhost      localhost      localhost
       :3001          :3002          :3003
```

## 📦 Structure des volumes

- `mythos-auth-db` : Base SQLite du service d'authentification
- `mythos-mongodb-data` : Données MongoDB (collections)
- `mythos-mongodb-config` : Configuration MongoDB

## 🔐 Variables d'environnement

Les variables d'environnement sont définies dans `docker-compose.yml`.

Pour modifier les secrets en production :

1. Créer un fichier `.env` à la racine
2. Utiliser `env_file` dans docker-compose.yml
3. Ne **jamais** commiter les secrets dans Git

Exemple de `.env` :

```env
JWT_SECRET=votre_secret_super_securise
MONGODB_URI=mongodb://mongodb:27017/mythos_lore
```

## 🚀 Déploiement production

Pour la production, pensez à :

1. Utiliser des secrets sécurisés
2. Retirer les volumes de développement (`./src:/app/src`)
3. Activer TLS/SSL pour MongoDB
4. Configurer un reverse proxy (nginx, traefik)
5. Mettre en place des backups automatiques
6. Utiliser Docker Swarm ou Kubernetes pour l'orchestration

---

✅ **Configuration Docker opérationnelle pour Mythos Archives**

# 📊 API Classification - Documentation

## Endpoints Disponibles

### 🔹 GET /mythology/classification

Récupère la classification hiérarchique complète de toutes les créatures.

**Authentification** : JWT requis (Bearer token)

**Headers** :

```
Authorization: Bearer <votre_token_jwt>
```

**Query Parameters (optionnels)** :

- `details=true` : Inclut les détails complets de chaque créature

**Réponse réussie** (200) :

```json
{
  "success": true,
  "message": "Classification générée avec succès",
  "data": {
    "totalCreatures": 10,
    "totalFamilies": 4,
    "familyDistribution": {
      "Nordique": 3,
      "Grec": 2,
      "Inventé": 4,
      "Unknown": 1
    },
    "classification": {
      "families": {
        "Nordique": {
          "Default": ["Fenrir", "Jormungandr"],
          "Loup": ["Sköll"]
        },
        "Grec": {
          "Serpent": ["Hydra"],
          "Oiseau": ["Phoenix"]
        },
        "Inventé": {
          "Dragon": ["Dragon de Feu", "Dragon des Neiges"],
          "Default": ["Créature Mystique", "Ombre Nocturne"]
        },
        "Unknown": {
          "Default": ["Créature Sans Origine"]
        }
      }
    }
  }
}
```

**Avec details=true** :

```json
{
  "success": true,
  "message": "Classification générée avec succès",
  "data": {
    "totalCreatures": 3,
    "totalFamilies": 2,
    "familyDistribution": {
      "Nordique": 2,
      "Inventé": 1
    },
    "classification": {
      "families": {
        "Nordique": {
          "Dragon": ["Dragon des Neiges"]
        },
        "Inventé": {
          "Dragon": ["Dragon de Feu"]
        }
      }
    },
    "details": [
      {
        "id": "69610a832166ff00a84f80c5",
        "name": "Dragon de Feu",
        "origin": "Montagnes du Nord",
        "family": "Inventé",
        "subtype": "Dragon",
        "legendScore": 4
      },
      {
        "id": "6960c42bf8f4385eb4fc0777",
        "name": "Dragon des Neiges",
        "origin": "Nordique",
        "family": "Nordique",
        "subtype": "Dragon",
        "legendScore": 1
      }
    ]
  }
}
```

---

### 🔹 GET /mythology/classification/families

Liste uniquement les familles mythologiques disponibles avec leur distribution.

**Authentification** : JWT requis

**Headers** :

```
Authorization: Bearer <votre_token_jwt>
```

**Réponse réussie** (200) :

```json
{
  "success": true,
  "message": "Familles récupérées avec succès",
  "data": {
    "families": ["Nordique", "Grec", "Inventé", "Unknown"],
    "distribution": {
      "Nordique": 3,
      "Grec": 2,
      "Inventé": 4,
      "Unknown": 1
    }
  }
}
```

---

## 🎯 Logique de Classification

### Familles Détectées

La classification analyse les champs `origin` et `name` de chaque créature pour détecter automatiquement sa famille mythologique :

| Famille          | Mots-clés détectés                                                      |
| ---------------- | ----------------------------------------------------------------------- |
| **Nordique**     | nordique, norse, viking, scandinave, odin, thor, nord, islande, norvège |
| **Grec**         | grec, grèce, olympe, zeus, athènes, hellenique, méditerranée            |
| **Égyptien**     | égyptien, egypt, pharaon, nil, ankh, sahara                             |
| **Celtique**     | celtique, celte, irlandais, breton, gaulois, druidique, écosse          |
| **Asiatique**    | asiatique, chinois, japonais, oriental, chine, japon, himalaya          |
| **Amérindien**   | amérindien, natif, aztèque, maya, inca                                  |
| **Africain**     | africain, afrique, subsaharien, tribal                                  |
| **Moyen-Orient** | perse, arabe, mesopotamien, babylonien, sumerien                        |
| **Slave**        | slave, russe, polonais, balkanique                                      |
| **Inventé**      | inventé, fiction, moderne, contemporain, original                       |
| **Unknown**      | Aucune correspondance trouvée                                           |

### Sous-types Détectés

Les sous-types précisent le type de créature dans sa famille :

| Sous-type   | Mots-clés détectés                   |
| ----------- | ------------------------------------ |
| **Dragon**  | dragon, drake, wyvern, wyrm          |
| **Serpent** | serpent, snake, hydra, basilic       |
| **Loup**    | loup, wolf, lycanthrope              |
| **Oiseau**  | oiseau, bird, phoenix, phénix, aigle |
| **Géant**   | géant, giant, titan, colosse         |
| **Esprit**  | esprit, spirit, fantôme, ghost, âme  |
| **Démon**   | démon, demon, diable, devil          |
| **Fée**     | fée, fairy, elfe, lutin              |
| **Default** | Aucune correspondance trouvée        |

### Exemples de Classification

**Créature** : "Dragon des Neiges"

- **Origin** : "Nordique"
- **Famille détectée** : Nordique (mot-clé "nordique")
- **Sous-type détecté** : Dragon (mot-clé "dragon")

**Créature** : "Phoenix de Sable"

- **Origin** : "Saharien"
- **Famille détectée** : Égyptien (mot-clé géographique "sahara")
- **Sous-type détecté** : Oiseau (mot-clé "phoenix")

**Créature** : "Créature Mystérieuse"

- **Origin** : "" (vide)
- **Famille détectée** : Unknown
- **Sous-type détecté** : Default

---

## 🧪 Exemples de Tests

### Test 1 : Classification complète

```http
GET http://localhost:3003/mythology/classification
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Test 2 : Avec détails

```http
GET http://localhost:3003/mythology/classification?details=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Test 3 : Liste des familles

```http
GET http://localhost:3003/mythology/classification/families
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚠️ Erreurs Possibles

| Code | Message                      | Cause                       |
| ---- | ---------------------------- | --------------------------- |
| 401  | Token manquant               | Header Authorization absent |
| 401  | Token invalide ou expiré     | JWT non valide              |
| 503  | Lore service non disponible  | lore-service down           |
| 500  | Erreur lors de la génération | Erreur serveur interne      |

---

## 🔧 Configuration Requise

**Variables d'environnement** (.env) :

```env
PORT=3003
LORE_SERVICE_URL=http://localhost:3002
AUTH_SERVICE_URL=http://localhost:3001
NODE_ENV=development
```

**Services requis** :

- ✅ auth-service (port 3001)
- ✅ lore-service (port 3002)
- ✅ JWT valide obtenu via `/auth/login`

---

## 📊 Structure de Réponse

La structure hiérarchique suit toujours ce format :

```
Classification
└── Families (objet)
    └── [Nom de Famille] (objet)
        └── [Sous-type] (array)
            └── [Noms de créatures] (strings)
```

**Exemple visuel** :

```
Classification
├── Nordique
│   ├── Dragon → ["Dragon des Glaces"]
│   └── Loup → ["Fenrir", "Sköll"]
├── Grec
│   ├── Serpent → ["Hydra"]
│   └── Default → ["Minotaure"]
└── Unknown
    └── Default → ["Créature X"]
```

import axios from 'axios';

const AUTH_URL = 'http://localhost:3001'; // Service d'authentification
const LORE_URL = 'http://localhost:3002'; // Service lore
const API_URL = `${LORE_URL}/api/creatures`;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Variables pour stocker les données de test
let expertToken: string;
let creatureId: string;

/**
 * Test de connexion au serveur
 */
async function testServerConnection() {
  log('\n🔌 Test préliminaire: Connexion aux serveurs', colors.blue);

  // Test Auth Service
  try {
    const authResponse = await axios.get(AUTH_URL, {
      timeout: 5000,
      validateStatus: () => true,
    });
    log(
      `✓ Auth service accessible sur ${AUTH_URL} (status: ${authResponse.status})`,
      colors.green,
    );
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      log(`✗ ERREUR: Auth service non accessible sur ${AUTH_URL}`, colors.red);
      log('  Démarre-le avec: npm run dev (dans auth-service)', colors.yellow);
      return false;
    }
  }

  // Test Lore Service
  try {
    const loreResponse = await axios.get(LORE_URL, {
      timeout: 5000,
      validateStatus: () => true,
    });
    log(
      `✓ Lore service accessible sur ${LORE_URL} (status: ${loreResponse.status})`,
      colors.green,
    );
    return true;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      log(`✗ ERREUR: Lore service non accessible sur ${LORE_URL}`, colors.red);
      log('  Démarre-le avec: npm run dev (dans lore-service)', colors.yellow);
    }
    return false;
  }
}

/**
 * Test 1: Obtenir un token d'authentification (EXPERT)
 */
async function testGetToken() {
  log('\n🔑 Test 1: Obtenir un token EXPERT', colors.blue);
  try {
    log(`  Tentative de connexion à: ${AUTH_URL}/auth/login`, colors.yellow);

    const response = await axios.post(
      `${AUTH_URL}/auth/login`,
      {
        email: 'test@example.com', // Utilise tes vraies credentials
        password: 'password123',
      },
      {
        timeout: 10000,
        validateStatus: (status) => status < 500,
      },
    );

    if (response.status === 200 && response.data.data?.token) {
      expertToken = response.data.data.token;
      log(`✓ Token obtenu: ${expertToken.substring(0, 20)}...`, colors.green);
      log(
        `  Utilisateur: ${response.data.data.user?.email || 'N/A'}`,
        colors.green,
      );
      log(`  Rôle: ${response.data.data.user?.role || 'N/A'}`, colors.green);

      if (
        response.data.data.user?.role !== 'EXPERT' &&
        response.data.data.user?.role !== 'ADMIN'
      ) {
        log(
          '  ⚠️  ATTENTION: L\'utilisateur n\'est pas EXPERT/ADMIN',
          colors.yellow,
        );
        log(
          '     Les tests de création vont probablement échouer',
          colors.yellow,
        );
      }

      return true;
    } else {
      log(`✗ Réponse inattendue (status ${response.status})`, colors.red);
      log(`  Données: ${JSON.stringify(response.data)}`, colors.yellow);
      return false;
    }
  } catch (error: any) {
    log('✗ ERREUR lors de l\'authentification', colors.red);

    if (error.code === 'ECONNREFUSED') {
      log('  Le auth-service est-il démarré ?', colors.yellow);
    } else if (error.response) {
      log(`  Status: ${error.response.status}`, colors.yellow);
      log(
        `  Message: ${error.response.data?.message || 'Aucun message'}`,
        colors.yellow,
      );
    } else if (error.request) {
      log('  Aucune réponse du serveur', colors.yellow);
    } else {
      log(`  ${error.message}`, colors.yellow);
    }

    log('\n  💡 Pour créer un utilisateur EXPERT:', colors.yellow);
    log(
      "     Utilise l'endpoint POST /auth/register avec role: EXPERT",
      colors.yellow,
    );

    return false;
  }
}

/**
 * Test 2: Créer une créature (POST /creatures)
 */
async function testCreateCreature() {
  log('\n📝 Test 2: Créer une créature', colors.blue);
  try {
    const newCreature = {
      name: `Créature Test ${Date.now()}`,
      origin: 'Monde des tests automatisés',
    };

    log(`  Envoi de: ${JSON.stringify(newCreature)}`, colors.yellow);

    const response = await axios.post(API_URL, newCreature, {
      headers: { Authorization: `Bearer ${expertToken}` },
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    if (response.status === 201 && response.data._id) {
      creatureId = response.data._id;
      log('✓ Créature créée avec succès!', colors.green);
      log(`  ID: ${creatureId}`);
      log(`  Nom: ${response.data.name}`);
      log(`  Origine: ${response.data.origin}`);
      log(`  Auteur: ${response.data.authorId}`);
      log(`  Score légendaire: ${response.data.legendScore}`);
      return true;
    } else {
      log(`✗ Réponse inattendue (status ${response.status})`, colors.red);
      log(`  Données: ${JSON.stringify(response.data)}`, colors.yellow);
      return false;
    }
  } catch (error: any) {
    log('✗ ERREUR lors de la création', colors.red);

    if (error.response) {
      log(`  Status: ${error.response.status}`, colors.yellow);
      log(
        `  Message: ${error.response.data?.message || 'Aucun'}`,
        colors.yellow,
      );

      if (error.response.status === 403) {
        log(
          "  ⚠️  L'utilisateur n'a pas le rôle EXPERT ou ADMIN",
          colors.yellow,
        );
      } else if (error.response.status === 401) {
        log('  ⚠️  Token invalide ou expiré', colors.yellow);
      }
    } else {
      log(`  ${error.message}`, colors.yellow);
    }
    return false;
  }
}

/**
 * Test 3: Lire toutes les créatures (GET /creatures)
 */
async function testGetAllCreatures() {
  log('\n📋 Test 3: Lire toutes les créatures', colors.blue);
  try {
    log(`  Requête vers: ${API_URL}`, colors.yellow);

    const response = await axios.get(API_URL, {
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    if (response.status === 200) {
      log('✓ Liste récupérée avec succès!', colors.green);
      log(`  Total: ${response.data.total}`);
      log(`  Page: ${response.data.page}/${response.data.totalPages}`);
      log(`  Résultats: ${response.data.creatures?.length || 0}`);

      if (response.data.creatures && response.data.creatures.length > 0) {
        log('\n  Exemple de créature:');
        const creature = response.data.creatures[0];
        log(`    - Nom: ${creature.name}`);
        log(`    - Origine: ${creature.origin || 'Non spécifiée'}`);
        log(`    - Score: ${creature.legendScore}`);
      } else {
        log('  ⚠️  Aucune créature dans la base', colors.yellow);
      }
      return true;
    } else {
      log(`✗ Réponse inattendue (status ${response.status})`, colors.red);
      log(`  Données: ${JSON.stringify(response.data)}`, colors.yellow);
      return false;
    }
  } catch (error: any) {
    log('✗ ERREUR lors de la récupération', colors.red);

    if (error.code === 'ECONNREFUSED') {
      log('  Le serveur lore-service est-il accessible ?', colors.yellow);
    } else if (error.response) {
      log(`  Status: ${error.response.status}`, colors.yellow);
      log(
        `  Message: ${error.response.data?.message || 'Aucun'}`,
        colors.yellow,
      );
    } else {
      log(`  ${error.message}`, colors.yellow);
    }
    return false;
  }
}

/**
 * Test 4: Lire une créature spécifique (GET /creatures/:id)
 */
async function testGetCreatureById() {
  log('\n🔍 Test 4: Lire une créature par ID', colors.blue);
  try {
    log(`  Requête vers: ${API_URL}/${creatureId}`, colors.yellow);

    const response = await axios.get(`${API_URL}/${creatureId}`, {
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    if (response.status === 200) {
      log('✓ Créature récupérée avec succès!', colors.green);
      log(`  ID: ${response.data._id}`);
      log(`  Nom: ${response.data.name}`);
      log(`  Origine: ${response.data.origin || 'Non spécifiée'}`);
      log(`  Auteur: ${response.data.authorId}`);
      log(`  Score légendaire: ${response.data.legendScore}`);
      log(`  Créée le: ${new Date(response.data.createdAt).toLocaleString()}`);
      return true;
    } else {
      log(`✗ Réponse inattendue (status ${response.status})`, colors.red);
      return false;
    }
  } catch (error: any) {
    log('✗ ERREUR', colors.red);
    if (error.response) {
      log(`  Status: ${error.response.status}`, colors.yellow);
      log(
        `  Message: ${error.response.data?.message || 'Aucun'}`,
        colors.yellow,
      );
    } else {
      log(`  ${error.message}`, colors.yellow);
    }
    return false;
  }
}

/**
 * Test 5: Tester la pagination
 */
async function testPagination() {
  log('\n📄 Test 5: Tester la pagination', colors.blue);
  try {
    const response = await axios.get(`${API_URL}?page=1&limit=5`, {
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    if (response.status === 200) {
      log('✓ Pagination testée avec succès!', colors.green);
      log('  Limite: 5');
      log(`  Page actuelle: ${response.data.page}`);
      log(`  Total de pages: ${response.data.totalPages}`);
      log(`  Résultats: ${response.data.creatures?.length || 0}`);
      return true;
    }
    return false;
  } catch (error: any) {
    log('✗ ERREUR', colors.red);
    if (error.response) {
      log(`  Status: ${error.response.status}`, colors.yellow);
    } else {
      log(`  ${error.message}`, colors.yellow);
    }
    return false;
  }
}

/**
 * Test 6: Tester la recherche par nom
 */
async function testSearch() {
  log('\n🔎 Test 6: Tester la recherche', colors.blue);
  try {
    const response = await axios.get(`${API_URL}?search=Test`, {
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    if (response.status === 200) {
      log('✓ Recherche effectuée avec succès!', colors.green);
      log(`  Résultats trouvés: ${response.data.creatures?.length || 0}`);
      if (response.data.creatures && response.data.creatures.length > 0) {
        response.data.creatures.forEach((c: any, i: number) => {
          log(`    ${i + 1}. ${c.name}`);
        });
      }
      return true;
    }
    return false;
  } catch (error: any) {
    log('✗ ERREUR', colors.red);
    if (error.response) {
      log(`  Status: ${error.response.status}`, colors.yellow);
    } else {
      log(`  ${error.message}`, colors.yellow);
    }
    return false;
  }
}

/**
 * Test 7: Tester la création sans authentification (doit échouer)
 */
async function testCreateWithoutAuth() {
  log('\n🚫 Test 7: Créer sans authentification (doit échouer)', colors.blue);
  try {
    await axios.post(
      API_URL,
      {
        name: 'Cette créature ne devrait pas être créée',
        origin: 'Nulle part',
      },
      {
        timeout: 10000,
        validateStatus: (status) => status < 500,
      },
    );

    log(
      '✗ PROBLÈME: La créature a été créée sans authentification!',
      colors.red,
    );
    return false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      log('✓ Sécurité OK: Accès refusé sans token (401)', colors.green);
      return true;
    }
    log('✗ Erreur inattendue', colors.red);
    if (error.response) {
      log(`  Status: ${error.response.status}`, colors.yellow);
    } else {
      log(`  ${error.message}`, colors.yellow);
    }
    return false;
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  log('='.repeat(60), colors.blue);
  log('🧪 TESTS DES ROUTES CRUD CRÉATURES', colors.blue);
  log('='.repeat(60), colors.blue);

  // Test préliminaire de connexion
  const serverOk = await testServerConnection();
  if (!serverOk) {
    log('\n❌ ARRÊT: Impossible de se connecter aux serveurs', colors.red);
    log('Vérifie que les deux services tournent :', colors.yellow);
    log('  - auth-service sur port 3001', colors.yellow);
    log('  - lore-service sur port 3002', colors.yellow);
    return;
  }

  const results = {
    passed: 0,
    failed: 0,
  };

  // Test 1: Authentification
  if (await testGetToken()) {
    results.passed++;

    // Test 2: Création
    if (await testCreateCreature()) {
      results.passed++;

      // Test 4: Lecture par ID (dépend de la création)
      if (await testGetCreatureById()) results.passed++;
      else results.failed++;
    } else {
      results.failed++;
      log('\n⚠️  Test 4 ignoré car la création a échoué', colors.yellow);
      results.failed++;
    }
  } else {
    results.failed++;
    log(
      "\n⚠️  Tests 2-4 ignorés car l'authentification a échoué",
      colors.yellow,
    );
    results.failed += 2;
  }

  // Test 3: Lecture de toutes les créatures (ne dépend pas de l'auth)
  if (await testGetAllCreatures()) results.passed++;
  else results.failed++;

  // Test 5: Pagination
  if (await testPagination()) results.passed++;
  else results.failed++;

  // Test 6: Recherche
  if (await testSearch()) results.passed++;
  else results.failed++;

  // Test 7: Sécurité
  if (await testCreateWithoutAuth()) results.passed++;
  else results.failed++;

  // Résumé
  log('\n' + '='.repeat(60), colors.blue);
  log('📊 RÉSUMÉ DES TESTS', colors.blue);
  log('='.repeat(60), colors.blue);
  log(`✓ Tests réussis: ${results.passed}`, colors.green);
  log(`✗ Tests échoués: ${results.failed}`, colors.red);
  log(
    `📈 Taux de réussite: ${(
      (results.passed / (results.passed + results.failed)) *
      100
    ).toFixed(1)}%`,
    results.failed === 0 ? colors.green : colors.yellow,
  );
  log('='.repeat(60), colors.blue);

  if (results.failed === 0) {
    log('\n🎉 Tous les tests sont passés avec succès!', colors.green);
  } else {
    log(
      '\n⚠️  Certains tests ont échoué. Vérifie les erreurs ci-dessus.',
      colors.yellow,
    );
  }
}

// Lancer les tests
runAllTests().catch((error) => {
  log(`\n💥 Erreur fatale: ${error.message}`, colors.red);
  log(`Stack: ${error.stack}`, colors.yellow);
  process.exit(1);
});

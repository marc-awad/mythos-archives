import { authServiceClient } from './services/auth.service';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

/**
 * Script de test pour vérifier la communication avec auth-service
 * Usage: ts-node src/test-auth.ts
 */

async function testAuthServiceCommunication() {
  console.log('🧪 Test de communication inter-services');
  console.log('=========================================\n');

  // Test 1: Health check
  console.log('1️⃣ Test du health check...');
  try {
    const isHealthy = await authServiceClient.healthCheck();
    if (isHealthy) {
      console.log('✅ Auth service est accessible\n');
    } else {
      console.log('❌ Auth service ne répond pas correctement\n');
    }
  } catch (error) {
    console.error('❌ Erreur lors du health check:', error);
    console.log('💡 Assurez-vous que auth-service tourne sur le port 3001\n');
  }

  // Test 2: Token invalide
  console.log('2️⃣ Test avec un token invalide...');
  try {
    await authServiceClient.verifyToken('invalid_token_xyz');
    console.log("❌ Le token invalide n'a pas été rejeté\n");
  } catch (error) {
    if (error instanceof Error) {
      console.log('✅ Token invalide correctement rejeté:', error.message, '\n');
    }
  }

  // Test 3: Token expiré
  console.log('3️⃣ Test avec un token expiré...');
  try {
    // Token JWT expiré (vous pouvez en générer un sur jwt.io)
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDAwMDF9.xxx';
    await authServiceClient.verifyToken(expiredToken);
    console.log("❌ Le token expiré n'a pas été rejeté\n");
  } catch (error) {
    if (error instanceof Error) {
      console.log('✅ Token expiré correctement rejeté:', error.message, '\n');
    }
  }

  // Test 4: Token valide (à remplacer par un vrai token)
  console.log('4️⃣ Test avec un token valide...');
  console.log(
    "💡 Pour tester avec un vrai token, vous devez d'abord vous connecter\n",
  );
  console.log('Étapes:');
  console.log('1. Lancez auth-service: cd auth-service && npm run dev');
  console.log('2. Créez un utilisateur via POST /auth/register');
  console.log('3. Connectez-vous via POST /auth/login pour obtenir un token');
  console.log("4. Remplacez 'YOUR_VALID_TOKEN' ci-dessous par votre token\n");

  // Décommentez et remplacez avec un vrai token pour tester
  /*
  const validToken = "YOUR_VALID_TOKEN";
  try {
    const user = await authServiceClient.verifyToken(validToken);
    console.log("✅ Token valide accepté");
    console.log("📋 Données utilisateur:", user, "\n");
  } catch (error) {
    if (error instanceof Error) {
      console.log("❌ Erreur avec le token:", error.message, "\n");
    }
  }
  */

  console.log('\n=========================================');
  console.log('✨ Tests terminés');
  console.log('=========================================');
}

// Exécuter les tests
testAuthServiceCommunication()
  .then(() => {
    console.log('\n✅ Tous les tests sont terminés');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });

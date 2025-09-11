#!/usr/bin/env node

/**
 * Script pour tester et identifier les problèmes spécifiques à Turbopack
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Charger les variables d'environnement
config()

console.log('🔍 TEST DES PROBLÈMES TURBOPACK + PRISMA')
console.log('=' .repeat(50))

// Test 1: Configuration Prisma basique
console.log('\n1️⃣ TEST CONFIGURATION PRISMA BASIQUE')
console.log('-'.repeat(40))

const prisma1 = new PrismaClient({
  log: ['error'],
})

try {
  await prisma1.$connect()
  console.log('✅ Connexion basique réussie')
  
  const result1 = await prisma1.$queryRaw`SELECT 1 as test`
  console.log('✅ Requête basique réussie:', result1[0])
  
} catch (error) {
  console.log('❌ Erreur configuration basique:', error.message)
} finally {
  await prisma1.$disconnect()
}

// Test 2: Configuration Prisma avec logs détaillés
console.log('\n2️⃣ TEST CONFIGURATION PRISMA AVEC LOGS')
console.log('-'.repeat(40))

const prisma2 = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

try {
  await prisma2.$connect()
  console.log('✅ Connexion avec logs réussie')
  
  const result2 = await prisma2.$queryRaw`SELECT 1 as test`
  console.log('✅ Requête avec logs réussie:', result2[0])
  
} catch (error) {
  console.log('❌ Erreur configuration avec logs:', error.message)
} finally {
  await prisma2.$disconnect()
}

// Test 3: Configuration Prisma avec datasources explicite
console.log('\n3️⃣ TEST CONFIGURATION PRISMA AVEC DATASOURCES')
console.log('-'.repeat(40))

const prisma3 = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

try {
  await prisma3.$connect()
  console.log('✅ Connexion avec datasources réussie')
  
  const result3 = await prisma3.$queryRaw`SELECT 1 as test`
  console.log('✅ Requête avec datasources réussie:', result3[0])
  
} catch (error) {
  console.log('❌ Erreur configuration avec datasources:', error.message)
} finally {
  await prisma3.$disconnect()
}

// Test 4: Test de requêtes multiples rapides (simule le comportement Turbopack)
console.log('\n4️⃣ TEST REQUÊTES MULTIPLES RAPIDES')
console.log('-'.repeat(40))

const prisma4 = new PrismaClient({
  log: ['error'],
})

try {
  await prisma4.$connect()
  console.log('✅ Connexion pour test multiple réussie')
  
  // Simuler plusieurs requêtes rapides comme dans Turbopack
  const promises = []
  for (let i = 0; i < 5; i++) {
    promises.push(prisma4.$queryRaw`SELECT ${i} as test`)
  }
  
  const results = await Promise.all(promises)
  console.log('✅ Requêtes multiples réussies:', results.length)
  
} catch (error) {
  console.log('❌ Erreur requêtes multiples:', error.message)
} finally {
  await prisma4.$disconnect()
}

// Test 5: Test de requêtes avec prepared statements
console.log('\n5️⃣ TEST PREPARED STATEMENTS')
console.log('-'.repeat(40))

const prisma5 = new PrismaClient({
  log: ['error'],
})

try {
  await prisma5.$connect()
  console.log('✅ Connexion pour prepared statements réussie')
  
  // Test de requête qui utilise des prepared statements
  const result5 = await prisma5.appointment.count()
  console.log('✅ Prepared statement réussie:', result5)
  
} catch (error) {
  console.log('❌ Erreur prepared statement:', error.message)
  console.log('   Code:', error.code)
  console.log('   Message complet:', error.message)
} finally {
  await prisma5.$disconnect()
}

// Test 6: Test de requête complexe avec relations
console.log('\n6️⃣ TEST REQUÊTE COMPLEXE AVEC RELATIONS')
console.log('-'.repeat(40))

const prisma6 = new PrismaClient({
  log: ['error'],
})

try {
  await prisma6.$connect()
  console.log('✅ Connexion pour requête complexe réussie')
  
  // Test de requête complexe qui pose problème
  const result6 = await prisma6.appointment.findMany({
    take: 1,
    include: {
      patient: {
        select: {
          id: true,
          nom: true,
          prenom: true
        }
      }
    }
  })
  console.log('✅ Requête complexe réussie:', result6.length)
  
} catch (error) {
  console.log('❌ Erreur requête complexe:', error.message)
  console.log('   Code:', error.code)
  console.log('   Message complet:', error.message)
} finally {
  await prisma6.$disconnect()
}

// Recommandations
console.log('\n7️⃣ RECOMMANDATIONS')
console.log('-'.repeat(40))

console.log('💡 Solutions pour les problèmes Turbopack + Prisma:')
console.log('   1. Désactiver Turbopack temporairement:')
console.log('      - Changer "dev": "next dev --turbo" en "dev": "next dev"')
console.log('   2. Utiliser une configuration Prisma plus robuste:')
console.log('      - Ajouter des timeouts de connexion')
console.log('      - Configurer le pool de connexions')
console.log('   3. Vérifier la configuration PostgreSQL:')
console.log('      - Augmenter max_connections')
console.log('      - Vérifier les prepared statements')
console.log('   4. Alternative: Utiliser le mode production local:')
console.log('      - npm run build && npm start')

console.log('\n🎯 TEST TERMINÉ')

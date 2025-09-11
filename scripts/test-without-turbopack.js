#!/usr/bin/env node

/**
 * Script pour tester la solution sans Turbopack
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'

console.log('🔍 TEST DE LA SOLUTION SANS TURBOPACK')
console.log('=' .repeat(50))

// 1. Sauvegarder le package.json actuel
console.log('\n1️⃣ SAUVEGARDE DU PACKAGE.JSON')
console.log('-'.repeat(40))

try {
  const packageJson = readFileSync('package.json', 'utf8')
  writeFileSync('package.json.backup', packageJson)
  console.log('✅ package.json sauvegardé dans package.json.backup')
} catch (error) {
  console.log('❌ Erreur sauvegarde:', error.message)
  process.exit(1)
}

// 2. Modifier le script dev pour désactiver Turbopack
console.log('\n2️⃣ MODIFICATION DU SCRIPT DEV')
console.log('-'.repeat(40))

try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
  
  if (packageJson.scripts.dev.includes('--turbo')) {
    packageJson.scripts.dev = packageJson.scripts.dev.replace(' --turbo', '')
    writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
    console.log('✅ Turbopack désactivé dans le script dev')
    console.log('   Nouveau script:', packageJson.scripts.dev)
  } else {
    console.log('ℹ️  Turbopack déjà désactivé')
  }
} catch (error) {
  console.log('❌ Erreur modification:', error.message)
  process.exit(1)
}

// 3. Instructions pour tester
console.log('\n3️⃣ INSTRUCTIONS POUR TESTER')
console.log('-'.repeat(40))

console.log('📋 Étapes à suivre:')
console.log('   1. Arrêtez le serveur actuel (Ctrl+C)')
console.log('   2. Exécutez: npm run dev')
console.log('   3. Testez les APIs qui posaient problème:')
console.log('      - /api/appointments')
console.log('      - /api/cabinet')
console.log('      - /api/patients/stats')
console.log('   4. Vérifiez qu\'il n\'y a plus d\'erreurs "prepared statement"')

console.log('\n4️⃣ RESTAURATION (si nécessaire)')
console.log('-'.repeat(40))

console.log('🔄 Pour restaurer Turbopack:')
console.log('   - Exécutez: node scripts/restore-turbopack.js')
console.log('   - Ou restaurez manuellement: package.json.backup')

console.log('\n5️⃣ DIAGNOSTIC ADDITIONNEL')
console.log('-'.repeat(40))

console.log('🔍 Si le problème persiste sans Turbopack:')
console.log('   1. Exécutez: npm run debug:database')
console.log('   2. Vérifiez la configuration PostgreSQL')
console.log('   3. Vérifiez les variables d\'environnement')
console.log('   4. Exécutez: npx prisma db push')

console.log('\n🎯 PRÊT POUR LE TEST')
console.log('=' .repeat(50))

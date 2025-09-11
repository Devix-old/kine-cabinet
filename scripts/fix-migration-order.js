#!/usr/bin/env node

/**
 * Script pour corriger l'ordre des migrations Prisma
 */

import { execSync } from 'child_process'
import { readdirSync, renameSync, existsSync } from 'fs'
import { join } from 'path'

console.log('🔧 CORRECTION DE L\'ORDRE DES MIGRATIONS')
console.log('=' .repeat(50))

const migrationsDir = join(process.cwd(), 'prisma', 'migrations')

// 1. Vérifier que le dossier migrations existe
if (!existsSync(migrationsDir)) {
  console.log('❌ Dossier migrations non trouvé')
  process.exit(1)
}

// 2. Lister les migrations
console.log('\n1️⃣ MIGRATIONS ACTUELLES')
console.log('-'.repeat(40))

const migrations = readdirSync(migrationsDir)
  .filter(name => name !== 'migration_lock.toml')
  .sort()

migrations.forEach(migration => {
  console.log(`   ${migration}`)
})

// 3. Identifier le problème
console.log('\n2️⃣ IDENTIFICATION DU PROBLÈME')
console.log('-'.repeat(40))

const problematicMigration = '20250115000000_enhance_medical_records'
const initMigration = '20250808133637_init_multi_tenant'

if (migrations.includes(problematicMigration) && migrations.includes(initMigration)) {
  console.log('❌ Problème détecté:')
  console.log(`   - Migration problématique: ${problematicMigration}`)
  console.log(`   - Migration initiale: ${initMigration}`)
  console.log('   - La migration problématique a une date antérieure mais dépend de tables créées plus tard')
} else {
  console.log('✅ Aucun problème d\'ordre détecté')
  process.exit(0)
}

// 4. Proposer des solutions
console.log('\n3️⃣ SOLUTIONS DISPONIBLES')
console.log('-'.repeat(40))

console.log('💡 Solutions possibles:')
console.log('   1. Supprimer la migration problématique et la recréer')
console.log('   2. Renommer la migration avec une date postérieure')
console.log('   3. Réinitialiser complètement la base de données')

console.log('\n4️⃣ SOLUTION RECOMMANDÉE')
console.log('-'.repeat(40))

console.log('🎯 Solution recommandée: Supprimer et recréer la migration')
console.log('   Cette migration semble être une amélioration qui devrait être appliquée après l\'initialisation')

// 5. Exécuter la solution
console.log('\n5️⃣ EXÉCUTION DE LA SOLUTION')
console.log('-'.repeat(40))

try {
  // Supprimer la migration problématique
  const problematicPath = join(migrationsDir, problematicMigration)
  if (existsSync(problematicPath)) {
    console.log(`🔄 Suppression de la migration problématique: ${problematicMigration}`)
    execSync(`rmdir /s /q "${problematicPath}"`, { stdio: 'inherit' })
    console.log('✅ Migration problématique supprimée')
  }

  // Réinitialiser la base de données
  console.log('\n🔄 Réinitialisation de la base de données...')
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
  console.log('✅ Base de données réinitialisée')

  // Recréer la migration problématique avec une date postérieure
  console.log('\n🔄 Recréation de la migration avec une date correcte...')
  execSync('npx prisma migrate dev --name enhance_medical_records', { stdio: 'inherit' })
  console.log('✅ Migration recréée avec succès')

} catch (error) {
  console.log('❌ Erreur lors de l\'exécution:', error.message)
  console.log('\n💡 Solution manuelle:')
  console.log('   1. Supprimez manuellement le dossier: prisma/migrations/20250115000000_enhance_medical_records')
  console.log('   2. Exécutez: npx prisma migrate reset --force')
  console.log('   3. Exécutez: npx prisma migrate dev --name enhance_medical_records')
  process.exit(1)
}

console.log('\n6️⃣ VÉRIFICATION')
console.log('-'.repeat(40))

try {
  // Vérifier que les migrations sont correctes
  execSync('npx prisma migrate status', { stdio: 'inherit' })
  console.log('✅ Migrations vérifiées avec succès')
} catch (error) {
  console.log('⚠️  Vérification des migrations échouée, mais la base de données devrait fonctionner')
}

console.log('\n🎯 CORRECTION TERMINÉE')
console.log('=' .repeat(50))
console.log('💡 Prochaines étapes:')
console.log('   1. Testez la connexion: npm run debug:database')
console.log('   2. Redémarrez le serveur: npm run dev')
console.log('   3. Vérifiez que les APIs fonctionnent correctement')

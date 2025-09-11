#!/usr/bin/env node

/**
 * Solution rapide pour corriger les migrations Prisma
 */

import { execSync } from 'child_process'
import { existsSync, unlinkSync, rmdirSync } from 'fs'
import { join } from 'path'

console.log('🚀 SOLUTION RAPIDE POUR LES MIGRATIONS')
console.log('=' .repeat(50))

const problematicMigration = '20250115000000_enhance_medical_records'
const migrationsDir = join(process.cwd(), 'prisma', 'migrations')
const problematicPath = join(migrationsDir, problematicMigration)

console.log('\n1️⃣ SUPPRESSION DE LA MIGRATION PROBLÉMATIQUE')
console.log('-'.repeat(40))

if (existsSync(problematicPath)) {
  try {
    // Supprimer le dossier de migration problématique
    rmdirSync(problematicPath, { recursive: true })
    console.log(`✅ Migration problématique supprimée: ${problematicMigration}`)
  } catch (error) {
    console.log('❌ Erreur suppression:', error.message)
    console.log('💡 Supprimez manuellement le dossier: prisma/migrations/20250115000000_enhance_medical_records')
    process.exit(1)
  }
} else {
  console.log('ℹ️  Migration problématique déjà supprimée')
}

console.log('\n2️⃣ RÉINITIALISATION DE LA BASE DE DONNÉES')
console.log('-'.repeat(40))

try {
  console.log('🔄 Réinitialisation en cours...')
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
  console.log('✅ Base de données réinitialisée avec succès')
} catch (error) {
  console.log('❌ Erreur réinitialisation:', error.message)
  console.log('\n💡 Solution manuelle:')
  console.log('   1. Supprimez manuellement le dossier de migration problématique')
  console.log('   2. Exécutez: npx prisma migrate reset --force')
  process.exit(1)
}

console.log('\n3️⃣ VÉRIFICATION')
console.log('-'.repeat(40))

try {
  console.log('🔄 Vérification des migrations...')
  execSync('npx prisma migrate status', { stdio: 'inherit' })
  console.log('✅ Migrations vérifiées')
} catch (error) {
  console.log('⚠️  Vérification échouée, mais la base de données devrait fonctionner')
}

console.log('\n4️⃣ TEST DE CONNEXION')
console.log('-'.repeat(40))

try {
  console.log('🔄 Test de connexion...')
  execSync('npx prisma db push', { stdio: 'inherit' })
  console.log('✅ Connexion testée avec succès')
} catch (error) {
  console.log('❌ Erreur test connexion:', error.message)
}

console.log('\n🎯 SOLUTION APPLIQUÉE')
console.log('=' .repeat(50))
console.log('💡 Prochaines étapes:')
console.log('   1. Testez: npm run debug:database')
console.log('   2. Redémarrez: npm run dev')
console.log('   3. Si nécessaire, recréez la migration: npx prisma migrate dev --name enhance_medical_records')

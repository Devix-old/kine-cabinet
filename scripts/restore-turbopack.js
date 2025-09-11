#!/usr/bin/env node

/**
 * Script pour restaurer Turbopack
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'

console.log('🔄 RESTAURATION DE TURBOPACK')
console.log('=' .repeat(50))

// Vérifier si la sauvegarde existe
if (!existsSync('package.json.backup')) {
  console.log('❌ Fichier de sauvegarde package.json.backup non trouvé')
  process.exit(1)
}

try {
  // Restaurer le package.json
  const backup = readFileSync('package.json.backup', 'utf8')
  writeFileSync('package.json', backup)
  console.log('✅ package.json restauré depuis la sauvegarde')
  
  // Supprimer la sauvegarde
  import('fs').then(fs => {
    fs.unlinkSync('package.json.backup')
    console.log('✅ Sauvegarde supprimée')
  })
  
  console.log('\n🎯 Turbopack restauré!')
  console.log('   Redémarrez le serveur avec: npm run dev')
  
} catch (error) {
  console.log('❌ Erreur restauration:', error.message)
  process.exit(1)
}

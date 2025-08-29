#!/usr/bin/env node

/**
 * Script de lancement pour la génération de données de test
 * Usage: npm run generate-test-data
 * ou: node scripts/run-test-data-generation.js
 */

const KineTestDataGenerator = require('./generate-kine-test-data')

console.log('🚀 Démarrage de la génération de données de test pour cabinet de kinésithérapie')
console.log('==================================================================')
console.log('')

async function main() {
  try {
    const generator = new KineTestDataGenerator()
    await generator.run()
    
    console.log('')
    console.log('✨ Données de test générées avec succès!')
    console.log('')
    console.log('📌 Prochaines étapes:')
    console.log('  1. Connectez-vous à votre application')
    console.log('  2. Naviguez vers http://localhost:3000/dashboard')
    console.log('  3. Explorez vos nouveaux patients, rendez-vous et traitements')
    console.log('')
    console.log('🔧 Pour relancer la génération:')
    console.log('  npm run generate-test-data')
    console.log('')
    
  } catch (error) {
    console.error('')
    console.error('❌ ERREUR lors de la génération:')
    console.error('================================')
    console.error('')
    
    if (error.message.includes('Aucun cabinet de kinésithérapie trouvé')) {
      console.error('🏥 Problème: Aucun cabinet de kinésithérapie trouvé dans la base de données')
      console.error('')
      console.error('💡 Solution:')
      console.error('  1. Connectez-vous à votre application')
      console.error('  2. Créez un cabinet de type "KINESITHERAPIE"')
      console.error('  3. Relancez ce script')
      console.error('')
    } else if (error.message.includes('Aucun utilisateur trouvé')) {
      console.error('👤 Problème: Aucun utilisateur trouvé dans le cabinet')
      console.error('')
      console.error('💡 Solution:')
      console.error('  1. Assurez-vous qu\'un utilisateur est associé au cabinet')
      console.error('  2. Vérifiez les données utilisateur dans la base')
      console.error('')
    } else {
      console.error('Détails de l\'erreur:')
      console.error(error.message)
      console.error('')
      console.error('Stack trace:')
      console.error(error.stack)
    }
    
    console.error('')
    console.error('🆘 Si le problème persiste:')
    console.error('  1. Vérifiez que la base de données est accessible')
    console.error('  2. Vérifiez les variables d\'environnement (.env)')
    console.error('  3. Vérifiez que Prisma est configuré correctement')
    console.error('')
    
    process.exit(1)
  }
}

// Gestion propre de l'arrêt du script
process.on('SIGINT', () => {
  console.log('')
  console.log('⚠️  Script interrompu par l\'utilisateur')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('')
  console.log('⚠️  Script terminé')
  process.exit(0)
})

// Lancement du script
main()


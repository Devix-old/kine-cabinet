const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

/**
 * Script de nettoyage des données de test
 * Supprime toutes les données de test d'un cabinet de kinésithérapie
 */

class TestDataCleaner {
  constructor() {
    this.cabinetId = null
  }

  async init() {
    console.log('🧹 Initialisation du nettoyage des données de test...')
    
    // Trouver un cabinet de kinésithérapie
    const cabinet = await prisma.cabinet.findFirst({
      where: { type: 'KINESITHERAPIE' }
    })

    if (!cabinet) {
      throw new Error('Aucun cabinet de kinésithérapie trouvé.')
    }

    this.cabinetId = cabinet.id
    console.log(`✅ Cabinet trouvé: ${cabinet.nom} (ID: ${this.cabinetId})`)
  }

  async cleanData() {
    console.log('\n🗑️  Suppression des données de test...')
    
    try {
      // Supprimer dans l'ordre inverse des dépendances
      
      console.log('  🗑️  Suppression des sessions...')
      const sessionsDeleted = await prisma.session.deleteMany({
        where: { cabinetId: this.cabinetId }
      })
      console.log(`    ✅ ${sessionsDeleted.count} sessions supprimées`)

      console.log('  🗑️  Suppression des notes...')
      const notesDeleted = await prisma.note.deleteMany({
        where: { cabinetId: this.cabinetId }
      })
      console.log(`    ✅ ${notesDeleted.count} notes supprimées`)

      console.log('  🗑️  Suppression des documents...')
      const documentsDeleted = await prisma.document.deleteMany({
        where: { cabinetId: this.cabinetId }
      })
      console.log(`    ✅ ${documentsDeleted.count} documents supprimés`)

      console.log('  🗑️  Suppression des dossiers médicaux...')
      const medicalRecordsDeleted = await prisma.medicalRecord.deleteMany({
        where: { cabinetId: this.cabinetId }
      })
      console.log(`    ✅ ${medicalRecordsDeleted.count} dossiers médicaux supprimés`)

      console.log('  🗑️  Suppression des traitements...')
      const treatmentsDeleted = await prisma.treatment.deleteMany({
        where: { cabinetId: this.cabinetId }
      })
      console.log(`    ✅ ${treatmentsDeleted.count} traitements supprimés`)

      console.log('  🗑️  Suppression des rendez-vous...')
      const appointmentsDeleted = await prisma.appointment.deleteMany({
        where: { cabinetId: this.cabinetId }
      })
      console.log(`    ✅ ${appointmentsDeleted.count} rendez-vous supprimés`)

      console.log('  🗑️  Suppression des patients...')
      const patientsDeleted = await prisma.patient.deleteMany({
        where: { cabinetId: this.cabinetId }
      })
      console.log(`    ✅ ${patientsDeleted.count} patients supprimés`)

      // Optionnel : supprimer les salles de test (commenté pour ne pas supprimer les salles existantes)
      // console.log('  🗑️  Suppression des salles...')
      // const roomsDeleted = await prisma.room.deleteMany({
      //   where: { cabinetId: this.cabinetId }
      // })
      // console.log(`    ✅ ${roomsDeleted.count} salles supprimées`)

      console.log('\n✨ Nettoyage terminé avec succès!')
      
      return {
        sessions: sessionsDeleted.count,
        notes: notesDeleted.count,
        documents: documentsDeleted.count,
        medicalRecords: medicalRecordsDeleted.count,
        treatments: treatmentsDeleted.count,
        appointments: appointmentsDeleted.count,
        patients: patientsDeleted.count
      }

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error)
      throw error
    }
  }

  async run() {
    try {
      await this.init()
      
      // Demander confirmation
      console.log('\n⚠️  ATTENTION: Cette action va supprimer TOUTES les données de test du cabinet!')
      console.log('⚠️  Cette action est IRRÉVERSIBLE!')
      console.log('\n❓ Voulez-vous vraiment continuer? (Cette confirmation est automatique dans ce script)')
      
      // Note: Dans un environnement de production, vous pourriez vouloir ajouter une vraie confirmation
      // Pour ce script de test, on procède automatiquement
      
      const stats = await this.cleanData()
      
      console.log('\n📊 Résumé du nettoyage:')
      console.log(`  👥 Patients supprimés: ${stats.patients}`)
      console.log(`  📅 Rendez-vous supprimés: ${stats.appointments}`)
      console.log(`  💪 Traitements supprimés: ${stats.treatments}`)
      console.log(`  🏃 Séances supprimées: ${stats.sessions}`)
      console.log(`  📋 Dossiers médicaux supprimés: ${stats.medicalRecords}`)
      console.log(`  📄 Documents supprimés: ${stats.documents}`)
      console.log(`  📝 Notes supprimées: ${stats.notes}`)
      
      console.log('\n💡 Vous pouvez maintenant:')
      console.log('  - Regénérer de nouvelles données avec: npm run generate-test-data')
      console.log('  - Ou commencer avec une base de données propre')
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error)
      throw error
    } finally {
      await prisma.$disconnect()
    }
  }
}

// Exécution du script
async function main() {
  const cleaner = new TestDataCleaner()
  await cleaner.run()
}

// Vérifier si le script est exécuté directement
if (require.main === module) {
  main().catch(console.error)
}

module.exports = TestDataCleaner


const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début de l\'initialisation de la base de données...')

  // 1. Créer les utilisateurs de test
  const users = await Promise.all([
    // Admin
    prisma.user.upsert({
      where: { email: 'admin@cabinet.com' },
      update: {},
      create: {
        email: 'admin@cabinet.com',
        name: 'Administrateur',
        role: 'ADMIN',
        password: await bcrypt.hash('admin123', 10)
      }
    }),
    // Kiné
    prisma.user.upsert({
      where: { email: 'kine@cabinet.com' },
      update: {},
      create: {
        email: 'kine@cabinet.com',
        name: 'Dr. Sophie Martin',
        role: 'KINE',
        password: await bcrypt.hash('kine123', 10)
      }
    }),
    // Secrétaire
    prisma.user.upsert({
      where: { email: 'secretaire@cabinet.com' },
      update: {},
      create: {
        email: 'secretaire@cabinet.com',
        name: 'Marie Dupont',
        role: 'SECRETAIRE',
        password: await bcrypt.hash('secretaire123', 10)
      }
    })
  ])

  console.log('✅ Utilisateurs créés:')
  users.forEach(user => {
    console.log(`  - ${user.name} (${user.role}): ${user.email}`)
  })

  // 2. Créer des salles par défaut
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { nom: 'Salle 1' },
      update: {},
      create: {
        nom: 'Salle 1',
        description: 'Salle principale de consultation',
        capacite: 1
      }
    }),
    prisma.room.upsert({
      where: { nom: 'Salle 2' },
      update: {},
      create: {
        nom: 'Salle 2',
        description: 'Salle de rééducation',
        capacite: 1
      }
    }),
    prisma.room.upsert({
      where: { nom: 'Salle d\'attente' },
      update: {},
      create: {
        nom: 'Salle d\'attente',
        description: 'Salle d\'attente des patients',
        capacite: 10
      }
    })
  ])

  console.log('✅ Salles créées:', rooms.length)

  // 3. Créer des tarifs par défaut
  const tarifs = await Promise.all([
    prisma.tarif.upsert({
      where: { nom: 'Consultation' },
      update: {},
      create: {
        nom: 'Consultation',
        description: 'Consultation de kinésithérapie',
        montant: 55.00,
        duree: 30
      }
    }),
    prisma.tarif.upsert({
      where: { nom: 'Séance de rééducation' },
      update: {},
      create: {
        nom: 'Séance de rééducation',
        description: 'Séance de rééducation complète',
        montant: 65.00,
        duree: 45
      }
    }),
    prisma.tarif.upsert({
      where: { nom: 'Bilan initial' },
      update: {},
      create: {
        nom: 'Bilan initial',
        description: 'Bilan complet et évaluation',
        montant: 80.00,
        duree: 60
      }
    })
  ])

  console.log('✅ Tarifs créés:', tarifs.length)

  // 4. Créer un patient de test
  const testPatient = await prisma.patient.upsert({
    where: { numeroDossier: 'K202501001' },
    update: {},
    create: {
      numeroDossier: 'K202501001',
      nom: 'Dupont',
      prenom: 'Marie',
      dateNaissance: new Date('1985-03-15'),
      sexe: 'FEMME',
      telephone: '0123456789',
      email: 'marie.dupont@email.com',
      adresse: '123 Rue de la Paix',
      ville: 'Paris',
      codePostal: '75001',
      profession: 'Enseignante',
      medecinTraitant: 'Dr. Martin',
      antecedents: 'Lombalgie chronique',
      allergies: 'Aucune',
      notesGenerales: 'Patient régulière depuis 2020'
    }
  })

  console.log('✅ Patient de test créé:', testPatient.nom, testPatient.prenom)

  console.log('🎉 Initialisation terminée avec succès!')
  console.log('\n📋 Comptes de test disponibles:')
  console.log('👑 Admin: admin@cabinet.com / admin123')
  console.log('�� Kiné: kine@cabinet.com / kine123')
  console.log('👩‍💼 Secrétaire: secretaire@cabinet.com / secretaire123')
  console.log('\n⚠️  N\'oubliez pas de changer les mots de passe en production!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
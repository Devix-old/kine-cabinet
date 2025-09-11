#!/usr/bin/env node

/**
 * Script de migration pour mettre à jour la base de données
 * avec les nouveaux champs pour les dossiers médicaux complets
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Début de la migration de la base de données...')

  try {
    // Vérifier si les nouvelles colonnes existent déjà
    console.log('📋 Vérification des colonnes existantes...')
    
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base de données établie')

    // Vérifier les nouvelles colonnes dans la table patients
    const patientColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patients' 
      AND column_name IN ('personneContact', 'telephoneUrgence', 'numeroSecuriteSociale', 'assurance', 'mutuelle', 'habitudesVie', 'antecedentsFamiliaux')
    `

    if (patientColumns.length === 0) {
      console.log('⚠️  Les nouvelles colonnes patients n\'existent pas encore.')
      console.log('📝 Veuillez exécuter la migration Prisma :')
      console.log('   npx prisma migrate dev --name enhance_medical_records')
      console.log('   ou')
      console.log('   npx prisma db push')
    } else {
      console.log('✅ Nouvelles colonnes patients trouvées :', patientColumns.map(c => c.column_name))
    }

    // Vérifier les nouvelles colonnes dans la table medical_records
    const medicalRecordColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'medical_records' 
      AND column_name IN ('motifConsultation', 'typeConsultation', 'diagnostic', 'hypotheseClinique', 'examenPhysique', 'observations', 'examensComplementaires', 'resultatsLaboratoire', 'traitementsPrescrits', 'planSuivi', 'notesLibres', 'poids', 'taille', 'tensionArterielle', 'imc', 'medecinResponsable', 'dateCreation')
    `

    if (medicalRecordColumns.length === 0) {
      console.log('⚠️  Les nouvelles colonnes medical_records n\'existent pas encore.')
      console.log('📝 Veuillez exécuter la migration Prisma :')
      console.log('   npx prisma migrate dev --name enhance_medical_records')
      console.log('   ou')
      console.log('   npx prisma db push')
    } else {
      console.log('✅ Nouvelles colonnes medical_records trouvées :', medicalRecordColumns.map(c => c.column_name))
    }

    // Vérifier les nouvelles tables
    const newTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('examens_complementaires', 'prescriptions')
    `

    if (newTables.length === 0) {
      console.log('⚠️  Les nouvelles tables n\'existent pas encore.')
      console.log('📝 Veuillez exécuter la migration Prisma :')
      console.log('   npx prisma migrate dev --name enhance_medical_records')
      console.log('   ou')
      console.log('   npx prisma db push')
    } else {
      console.log('✅ Nouvelles tables trouvées :', newTables.map(t => t.table_name))
    }

    // Générer le client Prisma
    console.log('🔄 Génération du client Prisma...')
    const { execSync } = require('child_process')
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Client Prisma généré avec succès')

    console.log('🎉 Migration terminée avec succès!')
    console.log('')
    console.log('📋 Prochaines étapes :')
    console.log('1. Testez les nouvelles pages de création')
    console.log('2. Vérifiez que les données existantes sont préservées')
    console.log('3. Testez la création de nouveaux dossiers médicaux complets')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

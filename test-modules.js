const { PrismaClient } = require('@prisma/client')
const { getCabinetConfig } = require('./src/lib/cabinet-configs')

const prisma = new PrismaClient()

async function testCabinetModules() {
  console.log('🧪 TEST COMPLET DES MODULES CABINET\n')
  
  const cabinetTypes = ['KINESITHERAPIE', 'DENTAIRE', 'MEDICAL_GENERAL', 'CARDIOLOGIE']
  
  for (const cabinetType of cabinetTypes) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🏥 TESTING: ${cabinetType}`)
    console.log(`${'='.repeat(60)}`)
    
    const config = getCabinetConfig(cabinetType)
    
    // Test 1: Configuration de base
    console.log('\n📋 1. CONFIGURATION DE BASE:')
    console.log(`   Nom: ${config.name}`)
    console.log(`   Nom d'affichage: ${config.displayName}`)
    console.log(`   Description: ${config.description}`)
    console.log(`   Icône: ${config.icon}`)
    console.log(`   Couleur: ${config.color}`)
    
    // Test 2: Modules activés
    console.log('\n🔧 2. MODULES ACTIVÉS:')
    const enabledModules = Object.entries(config.modules)
      .filter(([_, module]) => module.enabled)
      .map(([key, module]) => `${key} (${module.required ? 'requis' : 'optionnel'})`)
    
    enabledModules.forEach(module => {
      console.log(`   ✅ ${module}`)
    })
    
    // Test 3: Types de rendez-vous
    console.log('\n📅 3. TYPES DE RENDEZ-VOUS:')
    config.appointmentTypes.forEach(type => {
      console.log(`   • ${type.label} (${type.value}) - ${type.color}`)
    })
    
    // Test 4: Types de traitements
    console.log('\n💊 4. TYPES DE TRAITEMENTS:')
    if (config.treatmentTypes.length > 0) {
      config.treatmentTypes.forEach(type => {
        console.log(`   • ${type.label} (${type.value}) - ${type.color}`)
      })
    } else {
      console.log('   ❌ Aucun type de traitement configuré')
    }
    
    // Test 5: Types de dossiers médicaux
    console.log('\n📁 5. TYPES DE DOSSIERS MÉDICAUX:')
    config.medicalRecordTypes.forEach(type => {
      console.log(`   • ${type.label} (${type.value}) - ${type.color}`)
    })
    
    // Test 6: Terminologie spécifique
    console.log('\n📝 6. TERMINOLOGIE SPÉCIFIQUE:')
    Object.entries(config.terminology).forEach(([key, value]) => {
      console.log(`   ${key}: "${value}"`)
    })
    
    // Test 7: Fonctionnalités
    console.log('\n⭐ 7. FONCTIONNALITÉS:')
    config.features.forEach(feature => {
      console.log(`   • ${feature.name} - ${feature.description}`)
    })
    
    // Test 8: Configuration Hero
    console.log('\n🎯 8. CONFIGURATION HERO:')
    console.log(`   Titre: ${config.hero.title}`)
    console.log(`   Sous-titre: ${config.hero.subtitle}`)
    console.log(`   Description: ${config.hero.description}`)
    console.log(`   CTA: ${config.hero.cta}`)
  }
  
  console.log(`\n${'='.repeat(60)}`)
  console.log('✅ TEST DES CONFIGURATIONS TERMINÉ')
  console.log(`${'='.repeat(60)}`)
}

async function createTestCabinets() {
  console.log('\n\n🔧 CRÉATION DES CABINETS DE TEST\n')
  
  const testUsers = [
    { email: 'kine@test.com', cabinetType: 'KINESITHERAPIE', name: 'Test Kiné' },
    { email: 'dentiste@test.com', cabinetType: 'DENTAIRE', name: 'Test Dentaire' },
    { email: 'medecin@test.com', cabinetType: 'MEDICAL_GENERAL', name: 'Test Médecin' },
    { email: 'cardio@test.com', cabinetType: 'CARDIOLOGIE', name: 'Test Cardiologue' }
  ]
  
  for (const testUser of testUsers) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findFirst({
        where: { email: testUser.email }
      })
      
      if (existingUser) {
        console.log(`⚠️  Utilisateur ${testUser.email} existe déjà`)
        continue
      }
      
      // Créer le cabinet
      const cabinet = await prisma.cabinet.create({
        data: {
          nom: `Cabinet ${testUser.name}`,
          type: testUser.cabinetType,
          specialites: [],
          adresse: '123 Rue de Test',
          telephone: '0123456789',
          email: testUser.email,
          isActive: true,
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          isTrialActive: true,
          maxPatients: 100 // Plus pour les tests
        }
      })
      
      // Créer l'utilisateur admin
      const user = await prisma.user.create({
        data: {
          name: testUser.name,
          email: testUser.email,
          password: '$2a$10$test.hash.for.testing', // Mot de passe: test123
          role: 'ADMIN',
          isActive: true,
          cabinetId: cabinet.id
        }
      })
      
      console.log(`✅ Cabinet créé: ${cabinet.nom} (${testUser.cabinetType})`)
      console.log(`   Email: ${testUser.email}`)
      console.log(`   Mot de passe: test123`)
      
    } catch (error) {
      console.error(`❌ Erreur création ${testUser.email}:`, error.message)
    }
  }
}

async function main() {
  try {
    await testCabinetModules()
    await createTestCabinets()
    
    console.log('\n\n🎯 GUIDE DE TEST MANUEL:')
    console.log('1. Connectez-vous avec chaque compte de test')
    console.log('2. Vérifiez que l\'interface correspond au type de cabinet')
    console.log('3. Testez la création de patients, rendez-vous, traitements')
    console.log('4. Vérifiez que les appellations sont correctes')
    console.log('5. Testez les limites de patients (3 pour les nouveaux comptes)')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

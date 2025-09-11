#!/usr/bin/env node

/**
 * Script pour diagnostiquer les problèmes de session et cabinet
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

console.log('🔍 DIAGNOSTIC SESSION ET CABINET')
console.log('=' .repeat(50))

async function debugSession() {
  try {
    console.log('\n📋 VÉRIFICATION DES UTILISATEURS')
    console.log('-'.repeat(40))
    
    // Lister tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cabinetId: true,
        cabinet: {
          select: {
            id: true,
            nom: true,
            type: true,
            onboardingCompleted: true
          }
        }
      }
    })
    
    console.log(`\n👥 Utilisateurs trouvés: ${users.length}`)
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`)
      console.log(`   Role: ${user.role}`)
      console.log(`   CabinetId: ${user.cabinetId || 'NULL'}`)
      console.log(`   Cabinet: ${user.cabinet ? `${user.cabinet.nom} (${user.cabinet.type})` : 'NULL'}`)
      console.log(`   Onboarding: ${user.cabinet?.onboardingCompleted ? 'Complété' : 'Non complété'}`)
    })
    
    console.log('\n📋 VÉRIFICATION DES CABINETS')
    console.log('-'.repeat(40))
    
    // Lister tous les cabinets
    const cabinets = await prisma.cabinet.findMany({
      select: {
        id: true,
        nom: true,
        type: true,
        onboardingCompleted: true,
        isActive: true,
        _count: {
          select: {
            users: true,
            patients: true
          }
        }
      }
    })
    
    console.log(`\n🏢 Cabinets trouvés: ${cabinets.length}`)
    
    cabinets.forEach((cabinet, index) => {
      console.log(`\n${index + 1}. ${cabinet.nom} (${cabinet.type})`)
      console.log(`   ID: ${cabinet.id}`)
      console.log(`   Actif: ${cabinet.isActive}`)
      console.log(`   Onboarding: ${cabinet.onboardingCompleted ? 'Complété' : 'Non complété'}`)
      console.log(`   Utilisateurs: ${cabinet._count.users}`)
      console.log(`   Patients: ${cabinet._count.patients}`)
    })
    
    console.log('\n📋 VÉRIFICATION DES PROBLÈMES')
    console.log('-'.repeat(40))
    
    // Utilisateurs sans cabinet
    const usersWithoutCabinet = users.filter(u => !u.cabinetId && u.role !== 'SUPER_ADMIN')
    if (usersWithoutCabinet.length > 0) {
      console.log(`\n⚠️  ${usersWithoutCabinet.length} utilisateur(s) sans cabinet:`)
      usersWithoutCabinet.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`)
      })
    }
    
    // Cabinets sans utilisateurs
    const cabinetsWithoutUsers = cabinets.filter(c => c._count.users === 0)
    if (cabinetsWithoutUsers.length > 0) {
      console.log(`\n⚠️  ${cabinetsWithoutUsers.length} cabinet(s) sans utilisateurs:`)
      cabinetsWithoutUsers.forEach(cabinet => {
        console.log(`   - ${cabinet.nom} (${cabinet.id})`)
      })
    }
    
    // Cabinets avec onboarding non complété
    const incompleteOnboarding = cabinets.filter(c => !c.onboardingCompleted)
    if (incompleteOnboarding.length > 0) {
      console.log(`\n⚠️  ${incompleteOnboarding.length} cabinet(s) avec onboarding non complété:`)
      incompleteOnboarding.forEach(cabinet => {
        console.log(`   - ${cabinet.nom} (${cabinet.id})`)
      })
    }
    
    console.log('\n💡 RECOMMANDATIONS')
    console.log('-'.repeat(40))
    
    if (usersWithoutCabinet.length > 0) {
      console.log('\n🔧 Pour corriger les utilisateurs sans cabinet:')
      console.log('   1. Compléter l\'onboarding pour ces utilisateurs')
      console.log('   2. Ou les associer manuellement à un cabinet existant')
    }
    
    if (incompleteOnboarding.length > 0) {
      console.log('\n🔧 Pour corriger l\'onboarding:')
      console.log('   1. Aller sur /onboarding pour compléter la configuration')
      console.log('   2. Ou mettre à jour manuellement onboardingCompleted = true')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSession()

#!/usr/bin/env node

/**
 * Script simple pour tester la connexion Prisma
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  console.log('🔍 Test de connexion Prisma...')
  
  try {
    // Test de connexion basique
    console.log('1️⃣ Test de connexion...')
    await prisma.$connect()
    console.log('✅ Connexion établie')
    
    // Test de requête simple
    console.log('2️⃣ Test de requête simple...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Requête simple réussie:', result)
    
    // Test de requête sur appointments
    console.log('3️⃣ Test de requête sur appointments...')
    const appointmentCount = await prisma.appointment.count()
    console.log(`✅ Nombre d'appointments: ${appointmentCount}`)
    
    console.log('\n🎉 Tous les tests sont passés!')
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    
    if (error.message?.includes('prepared statement')) {
      console.log('\n💡 Solution: Redémarrez votre serveur de développement')
    } else if (error.code === 'P1001') {
      console.log('\n💡 Solution: Vérifiez votre DATABASE_URL')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Connexion fermée')
  }
}

testConnection()

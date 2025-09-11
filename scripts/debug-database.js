#!/usr/bin/env node

/**
 * Script de diagnostic complet pour identifier les problèmes de base de données
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Charger les variables d'environnement
config()

console.log('🔍 DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES')
console.log('=' .repeat(50))

// 1. Vérifier les fichiers d'environnement
console.log('\n1️⃣ VÉRIFICATION DES FICHIERS D\'ENVIRONNEMENT')
console.log('-'.repeat(40))

const envFiles = ['.env', '.env.local', '.env.development', '.env.production']
envFiles.forEach(file => {
  const exists = existsSync(file)
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'Existe' : 'Manquant'}`)
  
  if (exists) {
    try {
      const content = readFileSync(file, 'utf8')
      const hasDatabaseUrl = content.includes('DATABASE_URL')
      console.log(`   └─ DATABASE_URL: ${hasDatabaseUrl ? '✅ Présent' : '❌ Manquant'}`)
      
      if (hasDatabaseUrl) {
        const lines = content.split('\n')
        const dbLine = lines.find(line => line.startsWith('DATABASE_URL'))
        if (dbLine) {
          const url = dbLine.split('=')[1]
          const isPostgres = url.includes('postgresql://')
          const hasCredentials = url.includes('@')
          console.log(`   └─ Format PostgreSQL: ${isPostgres ? '✅' : '❌'}`)
          console.log(`   └─ Credentials: ${hasCredentials ? '✅' : '❌'}`)
        }
      }
    } catch (error) {
      console.log(`   └─ Erreur lecture: ${error.message}`)
    }
  }
})

// 2. Vérifier les variables d'environnement
console.log('\n2️⃣ VÉRIFICATION DES VARIABLES D\'ENVIRONNEMENT')
console.log('-'.repeat(40))

const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
requiredVars.forEach(varName => {
  const value = process.env[varName]
  const exists = !!value
  console.log(`${exists ? '✅' : '❌'} ${varName}: ${exists ? 'Défini' : 'Manquant'}`)
  
  if (exists && varName === 'DATABASE_URL') {
    const isPostgres = value.includes('postgresql://')
    const hasCredentials = value.includes('@')
    const hasHost = value.includes('://') && value.includes('@')
    console.log(`   └─ Format PostgreSQL: ${isPostgres ? '✅' : '❌'}`)
    console.log(`   └─ Credentials: ${hasCredentials ? '✅' : '❌'}`)
    console.log(`   └─ Host: ${hasHost ? '✅' : '❌'}`)
  }
})

// 3. Vérifier la configuration Prisma
console.log('\n3️⃣ VÉRIFICATION DE LA CONFIGURATION PRISMA')
console.log('-'.repeat(40))

try {
  const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')
  const schemaExists = existsSync(schemaPath)
  console.log(`${schemaExists ? '✅' : '❌'} schema.prisma: ${schemaExists ? 'Existe' : 'Manquant'}`)
  
  if (schemaExists) {
    const schema = readFileSync(schemaPath, 'utf8')
    const hasPostgresProvider = schema.includes('provider = "postgresql"')
    const hasDatabaseUrl = schema.includes('env("DATABASE_URL")')
    console.log(`   └─ Provider PostgreSQL: ${hasPostgresProvider ? '✅' : '❌'}`)
    console.log(`   └─ DATABASE_URL env: ${hasDatabaseUrl ? '✅' : '❌'}`)
  }
} catch (error) {
  console.log(`❌ Erreur lecture schema: ${error.message}`)
}

// 4. Test de connexion Prisma
console.log('\n4️⃣ TEST DE CONNEXION PRISMA')
console.log('-'.repeat(40))

if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL non défini - impossible de tester la connexion')
  process.exit(1)
}

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

try {
  console.log('🔄 Tentative de connexion...')
  await prisma.$connect()
  console.log('✅ Connexion Prisma établie')
  
  // Test de requête simple
  console.log('🔄 Test requête simple...')
  const result = await prisma.$queryRaw`SELECT 1 as test, version() as pg_version`
  console.log('✅ Requête simple réussie:', result[0])
  
  // Test de requête sur le modèle Appointment
  console.log('🔄 Test requête appointments...')
  const appointmentCount = await prisma.appointment.count()
  console.log(`✅ Nombre d'appointments: ${appointmentCount}`)
  
  // Test de requête complexe
  console.log('🔄 Test requête complexe...')
  const complexQuery = await prisma.appointment.findMany({
    take: 1,
    include: {
      patient: {
        select: {
          id: true,
          nom: true,
          prenom: true
        }
      }
    }
  })
  console.log(`✅ Requête complexe réussie: ${complexQuery.length} résultat(s)`)
  
} catch (error) {
  console.log('❌ Erreur de connexion:', error.message)
  console.log('   Code:', error.code)
  console.log('   Type:', error.constructor.name)
  
  if (error.message?.includes('prepared statement')) {
    console.log('\n💡 DIAGNOSTIC: Problème de prepared statements')
    console.log('   - Turbopack peut causer des problèmes avec les connexions persistantes')
    console.log('   - Les prepared statements sont invalidés lors des hot reloads')
    console.log('   - Solution: Désactiver temporairement Turbopack')
  } else if (error.code === 'P1001') {
    console.log('\n💡 DIAGNOSTIC: Problème de connexion réseau')
    console.log('   - Vérifiez que PostgreSQL est démarré')
    console.log('   - Vérifiez l\'URL de connexion')
    console.log('   - Vérifiez les credentials')
  } else if (error.code === 'P2021') {
    console.log('\n💡 DIAGNOSTIC: Table manquante')
    console.log('   - Exécutez: npx prisma db push')
    console.log('   - Ou: npx prisma migrate deploy')
  }
  
  process.exit(1)
} finally {
  await prisma.$disconnect()
  console.log('\n🔌 Connexion fermée')
}

// 5. Recommandations
console.log('\n5️⃣ RECOMMANDATIONS')
console.log('-'.repeat(40))

if (!process.env.DATABASE_URL) {
  console.log('🚨 CRITIQUE: Créez un fichier .env avec DATABASE_URL')
  console.log('   Exemple: DATABASE_URL="postgresql://user:password@localhost:5432/database"')
}

console.log('💡 Solutions possibles:')
console.log('   1. Créer un fichier .env avec DATABASE_URL')
console.log('   2. Désactiver Turbopack: npm run dev (sans --turbo)')
console.log('   3. Redémarrer PostgreSQL')
console.log('   4. Vérifier les credentials de la base de données')
console.log('   5. Exécuter: npx prisma db push')

console.log('\n🎯 DIAGNOSTIC TERMINÉ')

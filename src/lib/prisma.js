import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Create database URL with prepared statements disabled for all environments
// This fixes the "prepared statement already exists/does not exist" errors
function getDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) return baseUrl
  
  // Add parameters to disable prepared statements and optimize for serverless
  const url = new URL(baseUrl)
  url.searchParams.set('prepared_statements', 'false')
  url.searchParams.set('connection_limit', '1') // Single connection for serverless
  url.searchParams.set('pool_timeout', '20') // 20 second timeout
  url.searchParams.set('connect_timeout', '60') // 60 second connection timeout
  
  return url.toString()
}

// Configuration Prisma optimisée pour éviter les problèmes de connexion
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  // Configuration pour éviter les problèmes de prepared statements
  __internal: {
    engine: {
      connectTimeout: 30000,
      queryTimeout: 30000,
    },
  },
})

// Global Prisma instance management for serverless environments
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  
  // Gestion propre de la fermeture des connexions
  if (typeof window === 'undefined') {
    process.on('beforeExit', async () => {
      await prisma.$disconnect()
    })
    
    process.on('SIGINT', async () => {
      await prisma.$disconnect()
      process.exit(0)
    })
    
    process.on('SIGTERM', async () => {
      await prisma.$disconnect()
      process.exit(0)
    })
  }
} else {
  // Production: Use global instance to prevent multiple connections
  globalForPrisma.prisma = prisma
}

// Add error handling for prepared statement issues
prisma.$on('error', (e) => {
  console.error('Prisma error:', e.message)
  
  // If it's a prepared statement error, try to reconnect
  if (e.message.includes('prepared statement')) {
    console.log('Prepared statement error detected, attempting reconnection...')
    prisma.$disconnect().then(() => {
      console.log('Prisma disconnected, will reconnect on next query')
    }).catch(console.error)
  }
}) 
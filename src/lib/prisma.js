import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Configuration Prisma optimisée pour éviter les problèmes de connexion
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (process.env.NODE_ENV === 'development' ? '?pgbouncer=true&prepared_statements=false' : ''),
    },
  },
  // Configuration pour éviter les problèmes de prepared statements avec Turbopack
  __internal: {
    engine: {
      connectTimeout: 30000,
      queryTimeout: 30000,
    },
  },
})

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
} 
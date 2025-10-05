import { getDbClient, withDbClient } from './db-connection.js'

const globalForPrisma = globalThis

// Legacy Prisma client for backward compatibility
// In production, this will create a fresh client each time
export const prisma = getDbClient()

// Export the new connection utilities
export { getDbClient, withDbClient }

// Global Prisma instance management for development only
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
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Create optimized database URL with prepared statements disabled
function getOptimizedDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) throw new Error('DATABASE_URL is not set')
  
  const url = new URL(baseUrl)
  
  // CRITICAL: Disable prepared statements completely
  url.searchParams.set('prepared_statements', 'false')
  url.searchParams.set('statement_timeout', '0')
  
  // Serverless optimizations
  url.searchParams.set('connection_limit', '1')
  url.searchParams.set('pool_timeout', '5')
  url.searchParams.set('connect_timeout', '10')
  
  // Force unique connection names to prevent conflicts
  url.searchParams.set('application_name', `kine-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  
  // Additional PostgreSQL optimizations
  url.searchParams.set('options', [
    '-c default_transaction_isolation=read_committed',
    '-c log_statement=none',
    '-c log_min_duration_statement=-1'
  ].join(' '))
  
  return url.toString()
}

// Create fresh Prisma client for each request to prevent prepared statement conflicts
function createFreshPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
    datasources: {
      db: {
        url: getOptimizedDatabaseUrl(),
      },
    },
    __internal: {
      engine: {
        connectTimeout: 5000,  // Very short timeout for serverless
        queryTimeout: 10000,   // Short query timeout
      },
    },
  })
}

// Create a proxy that forces fresh client for every operation
export const prisma = new Proxy({}, {
  get(target, prop) {
    return new Proxy({}, {
      get(target, method) {
        return async (...args) => {
          const client = createFreshPrismaClient()
          try {
            return await client[prop][method](...args)
          } finally {
            try {
              await client.$disconnect()
            } catch (error) {
              // Ignore disconnect errors
            }
          }
        }
      }
    })
  }
})

// Export utilities
export { getOptimizedDatabaseUrl, createFreshPrismaClient }

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
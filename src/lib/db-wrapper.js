/**
 * Database Wrapper - Forces Fresh Connections for Every API Call
 * This is the most aggressive fix for prepared statement conflicts
 */

import { PrismaClient } from '@prisma/client'

// Create optimized database URL
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
  
  return url.toString()
}

// Create a fresh Prisma client for every request
function createFreshClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
    datasources: {
      db: {
        url: getOptimizedDatabaseUrl(),
      },
    },
    __internal: {
      engine: {
        connectTimeout: 3000,  // Very short timeout
        queryTimeout: 8000,    // Short query timeout
      },
    },
  })
}

// Wrapper function that creates fresh client for each operation
export async function withFreshDb(operation) {
  const client = createFreshClient()
  
  try {
    return await operation(client)
  } catch (error) {
    // If it's a prepared statement error, log it but don't retry
    // since we're already using fresh connections
    if (error.message?.includes('prepared statement')) {
      console.error('Prepared statement error with fresh client:', error.message)
    }
    throw error
  } finally {
    // Always disconnect to free up resources
    try {
      await client.$disconnect()
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
  }
}

// Create a proxy object that automatically uses fresh clients
export const db = new Proxy({}, {
  get(target, prop) {
    return new Proxy({}, {
      get(target, method) {
        return async (...args) => {
          return withFreshDb(async (client) => {
            return await client[prop][method](...args)
          })
        }
      }
    })
  }
})

// Export for direct use
export { createFreshClient, getOptimizedDatabaseUrl }

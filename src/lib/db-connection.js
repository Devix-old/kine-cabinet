/**
 * Database Connection Wrapper for Serverless Environments
 * This module provides a robust connection management system that prevents
 * prepared statement conflicts in Vercel's serverless functions.
 */

import { PrismaClient } from '@prisma/client'

// Track active connections to prevent memory leaks
const activeConnections = new Set()

/**
 * Create a fresh Prisma client with optimized settings for serverless
 */
function createFreshPrismaClient() {
  const client = new PrismaClient({
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

  // Track this connection
  activeConnections.add(client)
  
  // Auto-cleanup after 30 seconds (typical serverless function lifetime)
  setTimeout(async () => {
    try {
      await client.$disconnect()
      activeConnections.delete(client)
    } catch (error) {
      console.error('Error disconnecting Prisma client:', error)
    }
  }, 30000)

  return client
}

/**
 * Get optimized database URL for serverless environments
 */
export function getOptimizedDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) throw new Error('DATABASE_URL is not set')
  
  const url = new URL(baseUrl)
  
  // Critical: Disable prepared statements
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

/**
 * Get a database client for the current request
 * In production: creates a fresh client for each request
 * In development: reuses a single client
 */
export function getDbClient() {
  if (process.env.NODE_ENV === 'production') {
    // Production: Always create fresh client to avoid prepared statement conflicts
    return createFreshPrismaClient()
  } else {
    // Development: Use singleton pattern
    if (!globalThis.__prisma) {
      globalThis.__prisma = createFreshPrismaClient()
    }
    return globalThis.__prisma
  }
}

/**
 * Execute a database operation with automatic cleanup
 */
export async function withDbClient(operation) {
  const client = getDbClient()
  
  try {
    return await operation(client)
  } catch (error) {
    // If it's a prepared statement error, try with a fresh client
    if (error.message?.includes('prepared statement')) {
      console.log('Prepared statement error detected, retrying with fresh client...')
      const freshClient = createFreshPrismaClient()
      try {
        return await operation(freshClient)
      } finally {
        await freshClient.$disconnect().catch(console.error)
      }
    }
    throw error
  } finally {
    // In production, always disconnect after operation
    if (process.env.NODE_ENV === 'production') {
      await client.$disconnect().catch(console.error)
    }
  }
}

/**
 * Cleanup all active connections (useful for testing)
 */
export async function cleanupAllConnections() {
  const promises = Array.from(activeConnections).map(client => 
    client.$disconnect().catch(console.error)
  )
  await Promise.all(promises)
  activeConnections.clear()
}

// Default export for backward compatibility
export default getDbClient

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Aucun log pour un terminal propre
  log: [],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 
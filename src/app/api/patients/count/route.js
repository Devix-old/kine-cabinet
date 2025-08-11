import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/patients/count - Get patients count for current cabinet
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.cabinetId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const count = await prisma.patient.count({
      where: {
        cabinetId: session.user.cabinetId,
        isActive: true
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting patients:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

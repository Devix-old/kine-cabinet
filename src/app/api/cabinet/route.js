import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/cabinet - Get current cabinet info
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.cabinetId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const cabinet = await prisma.cabinet.findUnique({
      where: { id: session.user.cabinetId },
      select: {
        id: true,
        nom: true,
        adresse: true,
        telephone: true,
        email: true,
        siret: true,
        logo: true,
        isActive: true,
        trialStartDate: true,
        trialEndDate: true,
        isTrialActive: true,
        maxPatients: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!cabinet) {
      return NextResponse.json(
        { error: 'Cabinet non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ cabinet })
  } catch (error) {
    console.error('Error fetching cabinet:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/cabinet - Get current user's cabinet info
export async function GET(request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Get user with cabinet info
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      include: { 
        cabinet: {
          select: {
            id: true,
            nom: true,
            type: true,
            onboardingCompleted: true,
            specialites: true,
            adresse: true,
            telephone: true,
            email: true,
            isActive: true,
            subscriptions: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                plan: true
              }
            }
          }
        }
      }
    })

    if (!user?.cabinet) {
      return NextResponse.json(
        { error: 'Cabinet non trouvé' },
        { status: 404 }
      )
    }

    const [currentSubscription] = user.cabinet.subscriptions || []
    const cabinetPayload = { ...user.cabinet }
    delete cabinetPayload.subscriptions

    return NextResponse.json({
      cabinet: {
        ...cabinetPayload,
        currentSubscription: currentSubscription || null
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Error fetching cabinet info:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

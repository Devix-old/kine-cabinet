import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/cabinet/update-subscription - Update cabinet subscription status
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.cabinetId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId, isActive = true } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'planId est requis' },
        { status: 400 }
      )
    }

    // Update cabinet status
    const updatedCabinet = await prisma.cabinet.updateMany({
      where: { id: session.user.cabinetId },
      data: {
        isTrialActive: !isActive, // false if subscription is active
        trialEndDate: isActive ? new Date() : null, // End trial if subscription active
        maxPatients: planId === 'starter' ? 100 : 
                    planId === 'professional' ? 1000 : 
                    10000, // Unlimited for enterprise
        updatedAt: new Date()
      }
    })

    console.log('✅ Cabinet subscription status updated:', {
      cabinetId: session.user.cabinetId,
      planId,
      isActive,
      isTrialActive: !isActive
    })

    return NextResponse.json({
      success: true,
      message: 'Statut d\'abonnement mis à jour',
      cabinet: {
        isTrialActive: !isActive,
        maxPatients: planId === 'starter' ? 100 : 
                    planId === 'professional' ? 1000 : 
                    10000
      }
    })

  } catch (error) {
    console.error('Error updating cabinet subscription:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SubscriptionService } from '@/lib/subscription-service'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const cabinetId = session.user.cabinetId
    if (!cabinetId) {
      return NextResponse.json(
        { error: 'Cabinet non trouvé' },
        { status: 404 }
      )
    }

    const { planId } = await request.json()
    
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID requis' },
        { status: 400 }
      )
    }

    const result = await SubscriptionService.upgradeSubscription(cabinetId, planId)
    
    return NextResponse.json({
      message: 'Abonnement mis à jour avec succès',
      subscription: result.subscription,
      leftoverDays: result.leftoverDays,
      newPeriodEnd: result.newPeriodEnd
    })
  } catch (error) {
    console.error('Error upgrading subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

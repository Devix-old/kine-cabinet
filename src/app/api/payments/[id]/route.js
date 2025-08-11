import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCabinetIsolation } from '@/middleware/cabinetIsolation'

export const GET = withCabinetIsolation(async (request, context) => {
  try {
    const { session, cabinetId } = context
    const { params } = context
    const { id } = params

    const payment = await prisma.payment.findFirst({
      where: { 
        id,
        cabinetId
      },
      include: {
        subscription: {
          select: {
            id: true,
            planId: true,
            status: true,
            currentPeriodEnd: true
          }
        },
        invoice: {
          select: {
            id: true,
            numero: true,
            montant: true,
            statut: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Paiement non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      payment
    })

  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du paiement' },
      { status: 500 }
    )
  }
})

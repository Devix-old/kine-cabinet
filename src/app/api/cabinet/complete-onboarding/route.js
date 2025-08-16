import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/cabinet/complete-onboarding - mark onboarding complete
export async function PUT() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      select: { id: true, cabinetId: true }
    })

    if (!user?.cabinetId) {
      return NextResponse.json({ error: 'Cabinet non trouvé' }, { status: 404 })
    }

    const updated = await prisma.cabinet.update({
      where: { id: user.cabinetId },
      data: { onboardingCompleted: true, updatedAt: new Date() },
      select: { id: true, onboardingCompleted: true }
    })

    // Set a cookie for immediate middleware allowance
    const res = NextResponse.json({ message: 'Onboarding complété', cabinet: updated })
    res.cookies.set('onboardingCompleted', 'true', { path: '/' })
    return res
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}



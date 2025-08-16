import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/cabinet/update-name - Update cabinet name (unique)
export async function PUT(request) {
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

    const body = await request.json()
    const { name } = body || {}

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
    }

    const trimmed = name.trim().slice(0, 80)

    // Ensure uniqueness globally
    const existing = await prisma.cabinet.findUnique({ where: { nom: trimmed } })
    if (existing && existing.id !== user.cabinetId) {
      return NextResponse.json({ error: 'Un cabinet avec ce nom existe déjà' }, { status: 409 })
    }

    const updated = await prisma.cabinet.update({
      where: { id: user.cabinetId },
      data: { nom: trimmed, updatedAt: new Date() },
      select: { id: true, nom: true }
    })

    return NextResponse.json({ message: 'Nom mis à jour', cabinet: updated })
  } catch (error) {
    console.error('Error updating cabinet name:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}



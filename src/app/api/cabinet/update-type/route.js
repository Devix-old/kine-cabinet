import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/cabinet/update-type - Update cabinet type
export async function PUT(request) {
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
      include: { cabinet: true }
    })

    if (!user?.cabinetId) {
      return NextResponse.json(
        { error: 'Cabinet non trouvé' },
        { status: 404 }
      )
    }

    // Get request body
    const body = await request.json()
    const { cabinetType } = body

    if (!cabinetType) {
      return NextResponse.json(
        { error: 'Type de cabinet requis' },
        { status: 400 }
      )
    }

    // Update cabinet type
    const updatedCabinet = await prisma.cabinet.update({
      where: { id: user.cabinetId },
      data: { 
        type: cabinetType,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Type de cabinet mis à jour avec succès',
      cabinet: {
        id: updatedCabinet.id,
        type: updatedCabinet.type,
        nom: updatedCabinet.nom
      }
    })

  } catch (error) {
    console.error('Error updating cabinet type:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

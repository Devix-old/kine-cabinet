import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/sessions/[id] - Récupérer une session spécifique
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = params

    // Construire la requête selon le rôle de l'utilisateur
    let where = { id }
    
    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role !== 'SUPER_ADMIN') {
      where.cabinetId = session.user.cabinetId
    }

    const sessionData = await prisma.session.findFirst({
      where,
      include: {
        treatment: {
          include: {
            patient: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                numeroDossier: true
              }
            }
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            statut: true
          }
        }
      }
    })

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(sessionData)

  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la session' },
      { status: 500 }
    )
  }
}

// PUT /api/sessions/[id] - Mettre à jour une session
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { 
      date, 
      duree, 
      type, 
      description, 
      techniques, 
      observations, 
      douleur, 
      progression 
    } = body

    // Construire la requête selon le rôle de l'utilisateur
    let where = { id }
    
    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role !== 'SUPER_ADMIN') {
      where.cabinetId = session.user.cabinetId
    }

    // Vérifier que la session existe
    const existingSession = await prisma.session.findFirst({
      where
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Mettre à jour la session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        date: date ? new Date(date) : existingSession.date,
        duree: duree ? parseInt(duree) : existingSession.duree,
        type: type || existingSession.type,
        description: description !== undefined ? description : existingSession.description,
        techniques: techniques !== undefined ? techniques : existingSession.techniques,
        observations: observations !== undefined ? observations : existingSession.observations,
        douleur: douleur !== undefined ? (douleur ? parseInt(douleur) : null) : existingSession.douleur,
        progression: progression !== undefined ? progression : existingSession.progression
      },
      include: {
        treatment: {
          include: {
            patient: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                numeroDossier: true
              }
            }
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            statut: true
          }
        }
      }
    })

    return NextResponse.json(updatedSession)

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la session' },
      { status: 500 }
    )
  }
}

// DELETE /api/sessions/[id] - Supprimer une session
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = params

    // Construire la requête selon le rôle de l'utilisateur
    let where = { id }
    
    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role !== 'SUPER_ADMIN') {
      where.cabinetId = session.user.cabinetId
    }

    // Vérifier que la session existe
    const existingSession = await prisma.session.findFirst({
      where
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer la session
    await prisma.session.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Session supprimée avec succès' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la session' },
      { status: 500 }
    )
  }
} 
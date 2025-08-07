import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/treatments/[id] - Récupérer un traitement spécifique
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

    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroDossier: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        sessions: {
          orderBy: { date: 'desc' },
          select: {
            id: true,
            date: true,
            duree: true,
            type: true,
            description: true,
            observations: true,
            douleur: true,
            progression: true
          }
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: {
                name: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            sessions: true,
            notes: true
          }
        }
      }
    })

    if (!treatment) {
      return NextResponse.json(
        { error: 'Traitement non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(treatment)

  } catch (error) {
    console.error('Erreur lors de la récupération du traitement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du traitement' },
      { status: 500 }
    )
  }
}

// PUT /api/treatments/[id] - Mettre à jour un traitement
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
    const { nom, description, objectifs, duree, statut, dateDebut, dateFin } = body

    // Vérifier que le traitement existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id }
    })

    if (!existingTreatment) {
      return NextResponse.json(
        { error: 'Traitement non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le traitement
    const updatedTreatment = await prisma.treatment.update({
      where: { id },
      data: {
        nom: nom || existingTreatment.nom,
        description: description !== undefined ? description : existingTreatment.description,
        objectifs: objectifs !== undefined ? objectifs : existingTreatment.objectifs,
        duree: duree ? parseInt(duree) : existingTreatment.duree,
        statut: statut || existingTreatment.statut,
        dateDebut: dateDebut ? new Date(dateDebut) : existingTreatment.dateDebut,
        dateFin: dateFin ? new Date(dateFin) : existingTreatment.dateFin
      },
      include: {
        patient: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroDossier: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        sessions: {
          orderBy: { date: 'desc' }
        },
        _count: {
          select: {
            sessions: true,
            notes: true
          }
        }
      }
    })

    return NextResponse.json(updatedTreatment)

  } catch (error) {
    console.error('Erreur lors de la mise à jour du traitement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du traitement' },
      { status: 500 }
    )
  }
}

// DELETE /api/treatments/[id] - Supprimer un traitement
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

    // Vérifier que le traitement existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sessions: true,
            notes: true
          }
        }
      }
    })

    if (!existingTreatment) {
      return NextResponse.json(
        { error: 'Traitement non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le traitement (les sessions et notes seront supprimées automatiquement avec onDelete: Cascade)
    await prisma.treatment.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Traitement supprimé avec succès' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erreur lors de la suppression du traitement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du traitement' },
      { status: 500 }
    )
  }
} 
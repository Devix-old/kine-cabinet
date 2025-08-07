import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/treatments - Récupérer tous les traitements
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50
    const status = searchParams.get('status')
    const patientId = searchParams.get('patientId')

    const where = {}
    if (status && status !== 'all') {
      where.statut = status.toUpperCase()
    }
    if (patientId) {
      where.patientId = patientId
    }

    const treatments = await prisma.treatment.findMany({
      where,
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
        _count: {
          select: {
            sessions: true,
            notes: true
          }
        }
      },
      orderBy: { dateDebut: 'desc' },
      take: limit
    })

    // Calculer les statistiques
    const stats = {
      total: treatments.length,
      actif: treatments.filter(t => t.statut === 'ACTIF').length,
      termine: treatments.filter(t => t.statut === 'TERMINE').length,
      interrompu: treatments.filter(t => t.statut === 'INTERROMPU').length,
      totalSessions: treatments.reduce((sum, t) => sum + t._count.sessions, 0)
    }

    return NextResponse.json({
      treatments,
      stats,
      total: treatments.length
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des traitements:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des traitements' },
      { status: 500 }
    )
  }
}

// POST /api/treatments - Créer un nouveau traitement
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nom, description, objectifs, duree, patientId, dateDebut, dateFin } = body

    // Validation des champs requis
    if (!nom || !patientId) {
      return NextResponse.json(
        { error: 'Le nom et le patient sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      )
    }

    // Créer le traitement
    const treatment = await prisma.treatment.create({
      data: {
        nom,
        description,
        objectifs,
        duree: duree ? parseInt(duree) : null,
        dateDebut: dateDebut ? new Date(dateDebut) : new Date(),
        dateFin: dateFin ? new Date(dateFin) : null,
        patientId,
        createdById: session.user.id
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
        sessions: true,
        _count: {
          select: {
            sessions: true,
            notes: true
          }
        }
      }
    })

    return NextResponse.json(treatment, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du traitement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du traitement' },
      { status: 500 }
    )
  }
} 
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/sessions - Récupérer toutes les sessions
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
    const treatmentId = searchParams.get('treatmentId')
    const patientId = searchParams.get('patientId')

    const where = {}
    if (treatmentId) {
      where.treatmentId = treatmentId
    }
    if (patientId) {
      where.treatment = {
        patientId: patientId
      }
    }

    const sessions = await prisma.session.findMany({
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
      },
      orderBy: { date: 'desc' },
      take: limit
    })

    return NextResponse.json({
      sessions,
      total: sessions.length
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Créer une nouvelle session
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
    const { 
      treatmentId, 
      date, 
      duree, 
      type, 
      description, 
      techniques, 
      observations, 
      douleur, 
      progression,
      appointmentId 
    } = body

    // Validation des champs requis
    if (!treatmentId || !date) {
      return NextResponse.json(
        { error: 'Le traitement et la date sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le traitement existe
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: {
        patient: {
          select: {
            id: true,
            nom: true,
            prenom: true
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

    // Créer la session
    const newSession = await prisma.session.create({
      data: {
        treatmentId,
        date: new Date(date),
        duree: duree ? parseInt(duree) : 30,
        type: type || 'SEANCE',
        description,
        techniques,
        observations,
        douleur: douleur ? parseInt(douleur) : null,
        progression,
        appointmentId: appointmentId || null
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

    return NextResponse.json(newSession, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
} 
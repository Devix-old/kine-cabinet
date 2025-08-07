import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/notes - Récupérer toutes les notes
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
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const patientId = searchParams.get('patientId')
    const treatmentId = searchParams.get('treatmentId')
    const type = searchParams.get('type')

    const skip = (page - 1) * limit

    // Construire les conditions de filtre
    const where = {}
    
    if (patientId) {
      where.patientId = patientId
    }
    
    if (treatmentId) {
      where.treatmentId = treatmentId
    }
    
    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { contenu: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Récupérer les notes avec pagination
    const [notes, total] = await Promise.all([
      prisma.note.findMany({
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
          treatment: {
            select: {
              id: true,
              nom: true,
              statut: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.note.count({ where })
    ])

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }

    return NextResponse.json({
      notes,
      pagination
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des notes' },
      { status: 500 }
    )
  }
}

// POST /api/notes - Créer une nouvelle note
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
    const { titre, contenu, type, isPrivee, patientId, treatmentId } = body

    // Validation des champs requis
    if (!contenu) {
      return NextResponse.json(
        { error: 'Le contenu de la note est requis' },
        { status: 400 }
      )
    }

    if (!patientId && !treatmentId) {
      return NextResponse.json(
        { error: 'Un patient ou un traitement doit être spécifié' },
        { status: 400 }
      )
    }

    // Vérifier que le patient existe si spécifié
    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId }
      })

      if (!patient) {
        return NextResponse.json(
          { error: 'Patient non trouvé' },
          { status: 404 }
        )
      }
    }

    // Vérifier que le traitement existe si spécifié
    if (treatmentId) {
      const treatment = await prisma.treatment.findUnique({
        where: { id: treatmentId }
      })

      if (!treatment) {
        return NextResponse.json(
          { error: 'Traitement non trouvé' },
          { status: 404 }
        )
      }
    }

    // Créer la note
    const note = await prisma.note.create({
      data: {
        titre,
        contenu,
        type: type || 'GENERALE',
        isPrivee: isPrivee || false,
        patientId,
        treatmentId,
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
        treatment: {
          select: {
            id: true,
            nom: true,
            statut: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(note, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la note:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la note' },
      { status: 500 }
    )
  }
} 
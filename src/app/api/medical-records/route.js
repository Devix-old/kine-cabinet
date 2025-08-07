import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/medical-records - Récupérer tous les dossiers médicaux
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
    const type = searchParams.get('type')

    const skip = (page - 1) * limit

    // Construire les conditions de filtre
    const where = {}
    
    if (patientId) {
      where.patientId = patientId
    }
    
    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { patient: { nom: { contains: search, mode: 'insensitive' } } },
        { patient: { prenom: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Récupérer les dossiers médicaux avec pagination
    const [medicalRecords, total] = await Promise.all([
      prisma.medicalRecord.findMany({
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
          documents: {
            select: {
              id: true,
              nom: true,
              type: true,
              url: true,
              taille: true,
              extension: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              documents: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.medicalRecord.count({ where })
    ])

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }

    return NextResponse.json({
      medicalRecords,
      pagination
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers médicaux:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des dossiers médicaux' },
      { status: 500 }
    )
  }
}

// POST /api/medical-records - Créer un nouveau dossier médical
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
    const { titre, description, type, contenu, patientId, date } = body

    // Validation des champs requis
    if (!titre || !type || !patientId) {
      return NextResponse.json(
        { error: 'Titre, type et patient sont requis' },
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

    // Créer le dossier médical
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        titre,
        description,
        type,
        contenu,
        date: date ? new Date(date) : new Date(),
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
        documents: true
      }
    })

    return NextResponse.json(medicalRecord, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du dossier médical:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du dossier médical' },
      { status: 500 }
    )
  }
} 
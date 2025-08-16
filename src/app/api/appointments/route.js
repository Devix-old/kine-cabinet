import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getCabinetConfig } from '@/lib/cabinet-configs'

// GET /api/appointments - Récupérer tous les rendez-vous
export async function GET(request) {
  try {
    // Appointments API: GET request
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    const kineId = searchParams.get('kineId')
    const patientId = searchParams.get('patientId')

    const skip = (page - 1) * limit

    // Construire la requête de filtrage
    const where = {}

    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role === 'SUPER_ADMIN') {
      // Le super admin peut voir tous les rendez-vous
    } else {
      // Les autres utilisateurs ne voient que les rendez-vous de leur cabinet
      where.cabinetId = session.user.cabinetId
    }

    if (startDate && endDate) {
      // Filtrage par plage de dates (pour la vue semaine)
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (date) {
      // Filtrage par date exacte (pour la compatibilité)
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      where.date = {
        gte: startDate,
        lt: endDate
      }
    }

    if (status) {
      where.statut = status
    }

    if (kineId) {
      where.kineId = kineId
    }

    if (patientId) {
      where.patientId = patientId
    }

    // Récupérer les rendez-vous avec pagination (scoped to cabinet)
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          patient: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              numeroDossier: true,
              telephone: true
            }
          },
          kine: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          salle: {
            select: {
              id: true,
              nom: true
            }
          },
          tarif: {
            select: {
              id: true,
              nom: true,
              montant: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.appointment.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    // Appointments retrieved successfully

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('❌ Appointments API: Erreur GET:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Créer un nouveau rendez-vous
export async function POST(request) {
  try {
    console.log('🔍 Appointments API: POST request - Connexion automatique Prisma')
    
    const body = await request.json()
    
    // Validation des données requises
    if (!body.date || !body.patientId) {
      return NextResponse.json(
        { error: 'Date et patient sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({
      where: { id: body.patientId }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer l'utilisateur connecté
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const createdById = session.user.id
    const cabinetType = session.user.cabinetType
    const moduleConfig = getCabinetConfig(cabinetType || 'KINESITHERAPIE')

    // Vérifier les conflits de créneaux si une salle est spécifiée
    if (body.salleId) {
      const appointmentDate = new Date(body.date)
      const endTime = new Date(appointmentDate.getTime() + (body.duree || 30) * 60000)

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          salleId: body.salleId,
          date: {
            lt: endTime
          },
          statut: {
            in: ['PLANIFIE', 'CONFIRME']
          }
        }
      })

      if (conflictingAppointment) {
        const conflictingEndTime = new Date(conflictingAppointment.date.getTime() + conflictingAppointment.duree * 60000)
        
        if (appointmentDate < conflictingEndTime) {
          return NextResponse.json(
            { error: 'Conflit de créneau avec un autre rendez-vous' },
            { status: 409 }
          )
        }
      }
    }

    // Validation module-aware (appointment type allowed)
    if (body.type) {
      const allowedTypes = (moduleConfig?.appointmentTypes || []).map(t => t.value)
      if (!allowedTypes.includes(body.type)) {
        return NextResponse.json(
          { error: `Type de rendez-vous non autorisé pour le module ${cabinetType}` },
          { status: 400 }
        )
      }
    }

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(body.date),
        duree: parseInt(body.duree) || 30,
        statut: body.statut || 'PLANIFIE',
        type: body.type || 'CONSULTATION',
        notes: body.notes,
        motif: body.motif,
        patientId: body.patientId,
        kineId: body.kineId || null,
        salleId: body.salleId || null,
        tarifId: body.tarifId || null,
        createdById: createdById,
        cabinetId: session.user.cabinetId // Assigner au cabinet de l'utilisateur
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
        kine: {
          select: {
            id: true,
            name: true
          }
        },
        salle: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    })

    console.log('✅ Appointments API: Rendez-vous créé avec succès, ID:', appointment.id)
    return NextResponse.json(appointment, { status: 201 })

  } catch (error) {
    console.error('❌ Appointments API: Erreur POST:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du rendez-vous' },
      { status: 500 }
    )
  }
}
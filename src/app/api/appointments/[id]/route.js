import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/appointments/[id] - Récupérer un rendez-vous spécifique
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroDossier: true,
            telephone: true,
            email: true,
            dateNaissance: true
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
        },
        sessions: {
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(appointment)

  } catch (error) {
    console.error('Erreur lors de la récupération du rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rendez-vous' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments/[id] - Mettre à jour un rendez-vous
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Vérifier que le rendez-vous existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les conflits de créneaux si la date ou la salle change
    if ((body.date && body.date !== existingAppointment.date.toISOString()) || 
        (body.salleId && body.salleId !== existingAppointment.salleId)) {
      
      const appointmentDate = new Date(body.date || existingAppointment.date)
      const endTime = new Date(appointmentDate.getTime() + (body.duree || existingAppointment.duree) * 60000)

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: id }, // Exclure le rendez-vous actuel
          salleId: body.salleId || existingAppointment.salleId,
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

    // Mettre à jour le rendez-vous
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        duree: body.duree ? parseInt(body.duree) : undefined,
        statut: body.statut,
        type: body.type,
        notes: body.notes,
        motif: body.motif,
        patientId: body.patientId,
        kineId: body.kineId || null,
        salleId: body.salleId || null,
        tarifId: body.tarifId || null
        // createdById n'est pas modifiable lors de la mise à jour
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

    return NextResponse.json(updatedAppointment)

  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rendez-vous' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/[id] - Supprimer un rendez-vous
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    // Vérifier que le rendez-vous existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le rendez-vous (suppression définitive car pas de soft delete pour les RDV)
    await prisma.appointment.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Rendez-vous supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du rendez-vous' },
      { status: 500 }
    )
  }
}
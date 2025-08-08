import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/appointments/[id] - Récupérer un rendez-vous spécifique
export async function GET(request, { params }) {
  try {
    console.log(' Appointment Detail API: GET request - Connexion automatique Prisma')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const { id } = await params

    // Construire la requête selon le rôle de l'utilisateur
    let where = { id }
    
    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role !== 'SUPER_ADMIN') {
      where.cabinetId = session.user.cabinetId
    }

    const appointment = await prisma.appointment.findFirst({
      where,
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

    console.log('✅ Appointment Detail API: Rendez-vous récupéré, ID:', appointment.id)
    return NextResponse.json(appointment)

  } catch (error) {
    console.error('❌ Appointment Detail API: Erreur GET:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rendez-vous' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments/[id] - Mettre à jour un rendez-vous
export async function PUT(request, { params }) {
  try {
    console.log(' Appointment Detail API: PUT request - Connexion automatique Prisma')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()

    // Construire la requête selon le rôle de l'utilisateur
    let where = { id }
    
    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role !== 'SUPER_ADMIN') {
      where.cabinetId = session.user.cabinetId
    }

    // Vérifier que le rendez-vous existe
    const existingAppointment = await prisma.appointment.findFirst({
      where
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

    // Si le statut passe à TERMINE, créer automatiquement une facture
    if (body.statut === 'TERMINE') {
      try {
        const appointment = await prisma.appointment.findUnique({
          where: { id },
          include: { tarif: true }
        })
        
        if (appointment && appointment.tarif) {
          // Vérifier si une facture existe déjà pour ce rendez-vous
          const existingInvoice = await prisma.invoice.findFirst({
            where: { appointmentId: id }
          })
          
          if (!existingInvoice) {
            // Créer automatiquement la facture
            await prisma.invoice.create({
              data: {
                appointmentId: id,
                patientId: appointment.patientId,
                montant: appointment.tarif.montant,
                statut: 'EN_ATTENTE',
                dateEmission: new Date(),
                dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours
              }
            })
            console.log('✅ Facture créée automatiquement pour le RDV:', id)
          }
        }
      } catch (invoiceError) {
        console.error('⚠️ Erreur lors de la création automatique de facture:', invoiceError)
        // Ne pas faire échouer la mise à jour du RDV si la facture échoue
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
        },
        tarif: {
          select: {
            id: true,
            nom: true,
            montant: true
          }
        }
      }
    })

    console.log('✅ Appointment Detail API: Rendez-vous mis à jour, ID:', updatedAppointment.id)
    return NextResponse.json(updatedAppointment)

  } catch (error) {
    console.error('❌ Appointment Detail API: Erreur PUT:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rendez-vous' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/[id] - Supprimer un rendez-vous
export async function DELETE(request, { params }) {
  try {
    console.log(' Appointment Detail API: DELETE request - Connexion automatique Prisma')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const { id } = await params

    // Construire la requête selon le rôle de l'utilisateur
    let where = { id }
    
    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role !== 'SUPER_ADMIN') {
      where.cabinetId = session.user.cabinetId
    }

    // Vérifier que le rendez-vous existe
    const existingAppointment = await prisma.appointment.findFirst({
      where
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

    console.log('✅ Appointment Detail API: Rendez-vous supprimé, ID:', id)
    return NextResponse.json({ message: 'Rendez-vous supprimé avec succès' })

  } catch (error) {
    console.error('❌ Appointment Detail API: Erreur DELETE:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du rendez-vous' },
      { status: 500 }
    )
  }
}
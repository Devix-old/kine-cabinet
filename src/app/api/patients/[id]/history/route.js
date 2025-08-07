import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/patients/[id]/history - Récupérer l'historique complet d'un patient
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id: patientId } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50

    // Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        numeroDossier: true,
        dateNaissance: true,
        sexe: true,
        telephone: true,
        email: true,
        createdAt: true
      }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer l'historique des rendez-vous
    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        kine: {
          select: {
            id: true,
            name: true,
            role: true
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
        sessions: {
          include: {
            treatment: {
              select: {
                id: true,
                nom: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' },
      take: limit
    })

    // Récupérer les notes du patient
    const notes = await prisma.note.findMany({
      where: { patientId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        treatment: {
          select: {
            id: true,
            nom: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Récupérer les dossiers médicaux
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: { patientId },
      include: {
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
      orderBy: { date: 'desc' },
      take: limit
    })

    // Récupérer les traitements
    const treatments = await prisma.treatment.findMany({
      where: { patientId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        sessions: {
          orderBy: { date: 'desc' },
          take: 5, // Les 5 dernières sessions par traitement
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
          take: 3, // Les 3 dernières notes par traitement
          select: {
            id: true,
            titre: true,
            contenu: true,
            type: true,
            createdAt: true,
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
      },
      orderBy: { dateDebut: 'desc' }
    })

    // Calculer des statistiques
    const stats = {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(a => a.statut === 'TERMINE').length,
      cancelledAppointments: appointments.filter(a => a.statut === 'ANNULE').length,
      totalNotes: notes.length,
      totalMedicalRecords: medicalRecords.length,
      totalDocuments: medicalRecords.reduce((sum, record) => sum + record._count.documents, 0),
      activeTreatments: treatments.filter(t => t.statut === 'ACTIF').length,
      totalTreatments: treatments.length
    }

    // Créer une timeline combinée (les 20 événements les plus récents)
    const timelineEvents = []

    // Ajouter les rendez-vous
    appointments.forEach(appointment => {
      timelineEvents.push({
        id: `appointment-${appointment.id}`,
        type: 'appointment',
        date: appointment.date,
        title: `Rendez-vous ${appointment.type.toLowerCase()}`,
        description: appointment.motif || appointment.notes || 'Aucune description',
        status: appointment.statut,
        data: appointment
      })
    })

    // Ajouter les notes
    notes.forEach(note => {
      timelineEvents.push({
        id: `note-${note.id}`,
        type: 'note',
        date: note.createdAt,
        title: note.titre || `Note ${note.type.toLowerCase()}`,
        description: note.contenu.substring(0, 100) + (note.contenu.length > 100 ? '...' : ''),
        author: note.createdBy.name,
        data: note
      })
    })

    // Ajouter les dossiers médicaux
    medicalRecords.forEach(record => {
      timelineEvents.push({
        id: `medical-record-${record.id}`,
        type: 'medical-record',
        date: record.date,
        title: record.titre,
        description: record.description || 'Aucune description',
        recordType: record.type,
        author: record.createdBy.name,
        data: record
      })
    })

    // Trier la timeline par date décroissante et prendre les 20 plus récents
    const timeline = timelineEvents
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20)

    return NextResponse.json({
      patient,
      appointments,
      notes,
      medicalRecords,
      treatments,
      timeline,
      stats
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique du patient:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération de l\'historique du patient' },
      { status: 500 }
    )
  }
} 
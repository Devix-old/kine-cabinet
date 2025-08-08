import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/statistics/export - Export statistics data
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
    const format = searchParams.get('format') || 'csv'
    const period = searchParams.get('period') || 'month'
    const type = searchParams.get('type') || 'summary'

    // Calculate date range
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case 'week':
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        startDate = startOfWeek
        endDate = new Date(startOfWeek)
        endDate.setDate(startOfWeek.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
        break

      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999)
        break

      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
        break

      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    }

    if (type === 'detailed') {
      // Export detailed appointments and sessions data
      const [appointments, sessions] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            date: { gte: startDate, lte: endDate },
            ...(session.user.role !== 'SUPER_ADMIN' && { cabinetId: session.user.cabinetId })
          },
          include: {
            patient: {
              select: { nom: true, prenom: true, numeroDossier: true }
            },
            kine: {
              select: { name: true }
            },
            salle: {
              select: { nom: true }
            },
            tarif: {
              select: { nom: true, montant: true }
            }
          },
          orderBy: { date: 'desc' }
        }),

        prisma.session.findMany({
          where: {
            date: { gte: startDate, lte: endDate },
            ...(session.user.role !== 'SUPER_ADMIN' && { cabinetId: session.user.cabinetId })
          },
          include: {
            treatment: {
              include: {
                patient: {
                  select: { nom: true, prenom: true, numeroDossier: true }
                }
              }
            }
          },
          orderBy: { date: 'desc' }
        })
      ])

      if (format === 'csv') {
        // Generate CSV for detailed data
        const csvData = []
        
        // Add appointments data
        csvData.push('TYPE,DATE,PATIENT,KINE,SALLE,STATUT,TARIF,MONTANT,DUREE')
        appointments.forEach(appointment => {
          csvData.push([
            'Rendez-vous',
            new Date(appointment.date).toLocaleDateString('fr-FR'),
            `${appointment.patient?.prenom} ${appointment.patient?.nom}`,
            appointment.kine?.name || 'Non assigné',
            appointment.salle?.nom || 'Non assignée',
            appointment.statut,
            appointment.tarif?.nom || 'Aucun',
            appointment.tarif?.montant || 0,
            appointment.duree
          ].join(','))
        })

        // Add sessions data
        sessions.forEach(session => {
          csvData.push([
            'Séance',
            new Date(session.date).toLocaleDateString('fr-FR'),
            `${session.treatment?.patient?.prenom} ${session.treatment?.patient?.nom}`,
            'N/A',
            'N/A',
            'Réalisée',
            'N/A',
            0,
            session.duree
          ].join(','))
        })

        const csvContent = csvData.join('\n')
        
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="rapport-detaille-${period}-${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }
    } else {
      // Export summary statistics
      const [appointments, sessions, treatments] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            date: { gte: startDate, lte: endDate },
            statut: { in: ['TERMINE', 'CONFIRME', 'PLANIFIE'] },
            ...(session.user.role !== 'SUPER_ADMIN' && { cabinetId: session.user.cabinetId })
          },
          include: {
            patient: { select: { id: true } },
            tarif: { select: { montant: true } }
          }
        }),

        prisma.session.findMany({
          where: {
            date: { gte: startDate, lte: endDate },
            ...(session.user.role !== 'SUPER_ADMIN' && { cabinetId: session.user.cabinetId })
          }
        }),

        prisma.treatment.findMany({
          where: {
            ...(session.user.role !== 'SUPER_ADMIN' && { cabinetId: session.user.cabinetId })
          },
          include: {
            _count: { select: { sessions: true } }
          }
        })
      ])

      const uniquePatients = new Set(appointments.map(a => a.patient.id)).size
      const totalSessions = sessions.length
      const totalRevenue = appointments
        .filter(a => a.statut === 'TERMINE' && a.tarif)
        .reduce((sum, a) => sum + (a.tarif.montant || 0), 0)
      
      const activeTreatments = treatments.filter(t => t.statut === 'ACTIF').length
      const completedTreatments = treatments.filter(t => t.statut === 'TERMINE').length

      if (format === 'csv') {
        const csvData = []
        csvData.push('RAPPORT DE SYNTHESE')
        csvData.push(`Période: ${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`)
        csvData.push('')
        csvData.push('MÉTRIQUE,VALEUR')
        csvData.push(`Patients uniques,${uniquePatients}`)
        csvData.push(`Séances réalisées,${totalSessions}`)
        csvData.push(`Revenus générés,${totalRevenue.toLocaleString('fr-FR')} €`)
        csvData.push(`Traitements actifs,${activeTreatments}`)
        csvData.push(`Traitements terminés,${completedTreatments}`)
        csvData.push(`Total rendez-vous,${appointments.length}`)
        csvData.push('')
        csvData.push(`Généré le: ${new Date().toLocaleString('fr-FR')}`)

        const csvContent = csvData.join('\n')
        
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="rapport-synthese-${period}-${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }
    }

    // Default JSON response if format not supported
    return NextResponse.json({
      message: 'Format d\'export non supporté',
      supportedFormats: ['csv'],
      supportedTypes: ['summary', 'detailed']
    })

  } catch (error) {
    console.error('Erreur lors de l\'export des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des statistiques' },
      { status: 500 }
    )
  }
} 
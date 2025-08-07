import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/statistics - Récupérer les statistiques du cabinet
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
    const period = searchParams.get('period') || 'month'
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear()

    // Calculate date ranges based on period
    const now = new Date()
    let startDate, endDate, previousStartDate, previousEndDate

    switch (period) {
      case 'week':
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        startDate = startOfWeek
        endDate = new Date(startOfWeek)
        endDate.setDate(startOfWeek.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
        
        previousStartDate = new Date(startOfWeek)
        previousStartDate.setDate(startOfWeek.getDate() - 7)
        previousEndDate = new Date(startOfWeek)
        previousEndDate.setMilliseconds(-1)
        break

      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(year, quarter * 3, 1)
        endDate = new Date(year, quarter * 3 + 3, 0, 23, 59, 59, 999)
        
        previousStartDate = new Date(year, (quarter - 1) * 3, 1)
        previousEndDate = new Date(year, quarter * 3, 0, 23, 59, 59, 999)
        break

      case 'year':
        startDate = new Date(year, 0, 1)
        endDate = new Date(year, 11, 31, 23, 59, 59, 999)
        
        previousStartDate = new Date(year - 1, 0, 1)
        previousEndDate = new Date(year - 1, 11, 31, 23, 59, 59, 999)
        break

      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    }

    // Parallel execution of all statistics queries
    const [
      currentAppointments,
      previousAppointments,
      currentSessions,
      previousSessions,
      treatments,
      monthlyData,
      monthlySessionData,
      weeklyData,
      treatmentDistribution,
      patients
    ] = await Promise.all([
      // Current period appointments
      prisma.appointment.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          statut: { in: ['TERMINE', 'CONFIRME', 'PLANIFIE'] }
        },
        include: {
          patient: { select: { id: true } },
          tarif: { select: { montant: true } }
        }
      }),

      // Previous period appointments for comparison
      prisma.appointment.findMany({
        where: {
          date: { gte: previousStartDate, lte: previousEndDate },
          statut: { in: ['TERMINE', 'CONFIRME', 'PLANIFIE'] }
        },
        include: {
          patient: { select: { id: true } },
          tarif: { select: { montant: true } }
        }
      }),

      // FIXED: Current period sessions WITH appointment and tarif data
      prisma.session.findMany({
        where: {
          date: { gte: startDate, lte: endDate }
        },
        include: {
          treatment: {
            include: {
              patient: { select: { id: true } }
            }
          },
          appointment: {
            include: {
              tarif: { select: { montant: true } }
            }
          }
        }
      }),

      // FIXED: Previous period sessions WITH appointment and tarif data
      prisma.session.findMany({
        where: {
          date: { gte: previousStartDate, lte: previousEndDate }
        },
        include: {
          appointment: {
            include: {
              tarif: { select: { montant: true } }
            }
          }
        }
      }),

      // All treatments for success rate calculation
      prisma.treatment.findMany({
        include: {
          sessions: { select: { id: true } },
          _count: { select: { sessions: true } }
        }
      }),

      // Monthly appointment data for charts (last 12 months)
      prisma.appointment.findMany({
        where: {
          date: { 
            gte: new Date(now.getFullYear() - 1, now.getMonth(), 1),
            lte: endDate
          },
          statut: 'TERMINE'
        },
        include: {
          patient: { select: { id: true } },
          tarif: { select: { montant: true } }
        }
      }),

      // NEW: Monthly session data for charts
      prisma.session.findMany({
        where: {
          date: { 
            gte: new Date(now.getFullYear() - 1, now.getMonth(), 1),
            lte: endDate
          }
        },
        include: {
          treatment: {
            include: {
              patient: { select: { id: true } }
            }
          },
          appointment: {
            include: {
              tarif: { select: { montant: true } }
            }
          }
        }
      }),

      // Weekly data (current week)
      prisma.appointment.findMany({
        where: {
          date: { 
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()),
            lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6, 23, 59, 59)
          }
        },
        include: {
          patient: { select: { id: true } }
        }
      }),

      // Treatment type distribution
      prisma.treatment.groupBy({
        by: ['nom'],
        _count: { nom: true },
        orderBy: { _count: { nom: 'desc' } },
        take: 10
      }),

      // All patients for new patients calculation
      prisma.patient.findMany({
        select: { id: true, createdAt: true }
      })
    ])

    // Calculate current period metrics
    const uniqueCurrentPatients = new Set(currentAppointments.map(a => a.patient.id)).size
    const uniquePreviousPatients = new Set(previousAppointments.map(a => a.patient.id)).size
    
    const currentSessionsCount = currentSessions.length
    const previousSessionsCount = previousSessions.length

    // FIXED: Calculate revenue INCLUDING sessions
    const appointmentRevenue = currentAppointments
      .filter(a => a.statut === 'TERMINE' && a.tarif)
      .reduce((sum, a) => sum + (a.tarif.montant || 0), 0)

    const sessionRevenue = currentSessions
      .filter(s => s.appointment && s.appointment.tarif)
      .reduce((sum, s) => sum + (s.appointment.tarif.montant || 0), 0)

    const currentRevenue = appointmentRevenue + sessionRevenue

    // FIXED: Previous period revenue INCLUDING sessions
    const previousAppointmentRevenue = previousAppointments
      .filter(a => a.statut === 'TERMINE' && a.tarif)
      .reduce((sum, a) => sum + (a.tarif.montant || 0), 0)

    const previousSessionRevenue = previousSessions
      .filter(s => s.appointment && s.appointment.tarif)
      .reduce((sum, s) => sum + (s.appointment.tarif.montant || 0), 0)

    const previousRevenue = previousAppointmentRevenue + previousSessionRevenue

    // Calculate growth rates
    const calculateGrowthRate = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous * 100)
    }

    // FIXED: Process monthly data INCLUDING sessions
    const monthlyStats = {}
    
    // Process appointments
    monthlyData.forEach(appointment => {
      const monthKey = new Date(appointment.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          patients: new Set(),
          sessions: 0,
          revenue: 0
        }
      }
      monthlyStats[monthKey].patients.add(appointment.patient.id)
      if (appointment.statut === 'TERMINE') {
        monthlyStats[monthKey].sessions += 1
        monthlyStats[monthKey].revenue += appointment.tarif?.montant || 0
      }
    })

    // Process sessions (ADD TO MONTHLY DATA)
    monthlySessionData.forEach(session => {
      const monthKey = new Date(session.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          patients: new Set(),
          sessions: 0,
          revenue: 0
        }
      }
      monthlyStats[monthKey].patients.add(session.treatment.patient.id)
      monthlyStats[monthKey].sessions += 1
      monthlyStats[monthKey].revenue += session.appointment?.tarif?.montant || 0
    })

    const monthlyDataFormatted = Object.values(monthlyStats).map(month => ({
      ...month,
      patients: month.patients.size
    })).slice(-6) // Last 6 months

    // Process weekly data
    const weeklyStats = {}
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    
    // Initialize all days
    dayNames.forEach(day => {
      weeklyStats[day] = { day, sessions: 0, patients: new Set() }
    })

    weeklyData.forEach(appointment => {
      const dayName = dayNames[new Date(appointment.date).getDay()]
      weeklyStats[dayName].sessions += 1
      weeklyStats[dayName].patients.add(appointment.patient.id)
    })

    const weeklyDataFormatted = Object.values(weeklyStats).map(day => ({
      ...day,
      patients: day.patients.size
    }))

    // Process treatment distribution
    const totalTreatments = treatmentDistribution.reduce((sum, t) => sum + t._count.nom, 0)
    const treatmentTypes = treatmentDistribution.map((treatment, index) => ({
      name: treatment.nom,
      value: Math.round((treatment._count.nom / totalTreatments) * 100),
      count: treatment._count.nom,
      color: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
        '#6B7280', '#14B8A6', '#F97316', '#84CC16', '#EC4899'
      ][index % 10]
    }))

    // Calculate performance metrics
    const newPatientsThisPeriod = patients.filter(p => 
      new Date(p.createdAt) >= startDate && new Date(p.createdAt) <= endDate
    ).length

    const activePatients = new Set(currentAppointments.map(a => a.patient.id)).size
    const completedTreatments = treatments.filter(t => t.statut === 'TERMINE').length
    const successRate = treatments.length > 0 ? Math.round((completedTreatments / treatments.length) * 100) : 0

    // Calculate average session duration
    const averageSessionDuration = currentSessions.length > 0 
      ? Math.round(currentSessions.reduce((sum, s) => sum + s.duree, 0) / currentSessions.length)
      : 30

    // Calculate occupancy rate (assuming 8 hours workday, 6 days a week)
    const workingHoursPerWeek = 8 * 6 * 60 // in minutes
    const actualSessionMinutes = currentSessions.reduce((sum, s) => sum + s.duree, 0)
    const weeksInPeriod = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000))
    const totalAvailableMinutes = workingHoursPerWeek * weeksInPeriod
    const occupancyRate = totalAvailableMinutes > 0 
      ? Math.round((actualSessionMinutes / totalAvailableMinutes) * 100)
      : 0

    // Patient satisfaction data (placeholder for real rating system)
    const patientSatisfaction = [
      { rating: '5 étoiles', count: Math.round(activePatients * 0.75), percentage: 75 },
      { rating: '4 étoiles', count: Math.round(activePatients * 0.20), percentage: 20 },
      { rating: '3 étoiles', count: Math.round(activePatients * 0.03), percentage: 3 },
      { rating: '2 étoiles', count: Math.round(activePatients * 0.02), percentage: 2 },
      { rating: '1 étoile', count: 0, percentage: 0 },
    ]

    const averageSatisfaction = 4.7 // Could be calculated from real ratings

    const response = {
      period,
      dateRange: { startDate, endDate },
      
      // Key metrics
      metrics: {
        patients: {
          current: uniqueCurrentPatients,
          previous: uniquePreviousPatients,
          growthRate: calculateGrowthRate(uniqueCurrentPatients, uniquePreviousPatients)
        },
        sessions: {
          current: currentSessionsCount,
          previous: previousSessionsCount,
          growthRate: calculateGrowthRate(currentSessionsCount, previousSessionsCount)
        },
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growthRate: calculateGrowthRate(currentRevenue, previousRevenue)
        },
        satisfaction: {
          average: averageSatisfaction,
          distribution: patientSatisfaction
        }
      },

      // Chart data
      charts: {
        monthly: monthlyDataFormatted,
        weekly: weeklyDataFormatted,
        treatmentTypes
      },

      // Performance indicators
      performance: {
        averageSessionDuration,
        newPatients: newPatientsThisPeriod,
        successRate,
        occupancyRate,
        totalTreatments: treatments.length,
        activeTreatments: treatments.filter(t => t.statut === 'ACTIF').length
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors du calcul des statistiques' },
      { status: 500 }
    )
  }
} 
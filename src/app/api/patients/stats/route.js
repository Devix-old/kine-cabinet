import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/patients/stats - Récupérer les statistiques des patients
export async function GET(request) {
  try {
    console.log(' Patients Stats API: GET request - Connexion automatique Prisma')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Calculer les vraies statistiques
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    // Construire les filtres selon le rôle de l'utilisateur
    const baseWhere = {}
    if (session.user.role !== 'SUPER_ADMIN') {
      baseWhere.cabinetId = session.user.cabinetId
    }

    // Compter les patients
    const [totalPatients, activePatients, newThisMonth, appointmentsThisWeek] = await Promise.all([
      prisma.patient.count({ where: baseWhere }),
      prisma.patient.count({ where: { ...baseWhere, isActive: true } }),
      prisma.patient.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      prisma.appointment.count({
        where: {
          ...baseWhere,
          date: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      })
    ])

    const stats = {
      total: totalPatients,
      active: activePatients,
      newThisMonth: newThisMonth,
      appointmentsThisWeek: appointmentsThisWeek
    }

    console.log('✅ Patients Stats API: Statistiques calculées:', stats)
    return NextResponse.json(stats)

  } catch (error) {
    console.error('❌ Patients Stats API: Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors du calcul des statistiques' },
      { status: 500 }
    )
  }
}
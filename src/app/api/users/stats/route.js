import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/users/stats - Get user statistics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Calculate date ranges
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        endDate = now
        break
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        endDate = now
        break
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
        endDate = now
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = now
    }

    // Execute parallel queries for better performance
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers,
      usersByRole,
      recentActivity,
      topActiveUsers
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users
      prisma.user.count({
        where: { isActive: true }
      }),

      // Inactive users
      prisma.user.count({
        where: { isActive: false }
      }),

      // New users in period
      prisma.user.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
        where: { isActive: true }
      }),

      // Recent user activity (last 10)
      prisma.user.findMany({
        where: {
          lastLogin: { gte: startDate }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLogin: true
        },
        orderBy: { lastLogin: 'desc' },
        take: 10
      }),

      // Top active users by created content
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          role: true,
          _count: {
            select: {
              appointmentsCreated: true,
              appointmentsAssigned: true,
              treatmentsCreated: true,
              medicalRecordsCreated: true,
              notesCreated: true
            }
          }
        },
        take: 5
      })
    ])

    // Calculate additional metrics
    const usersWithRecentLogin = await prisma.user.count({
      where: {
        lastLogin: { gte: startDate },
        isActive: true
      }
    })

    const loginRate = activeUsers > 0 ? (usersWithRecentLogin / activeUsers * 100) : 0

    // Format role distribution
    const roleDistribution = usersByRole.map(role => ({
      role: role.role,
      count: role._count.role,
      label: {
        'ADMIN': 'Administrateurs',
        'KINE': 'Kinésithérapeutes',
        'SECRETAIRE': 'Secrétaires'
      }[role.role] || role.role
    }))

    // Calculate activity scores for top users
    const topUsersWithActivity = topActiveUsers.map(user => {
      const activityScore = 
        (user._count.appointmentsCreated * 1) +
        (user._count.appointmentsAssigned * 1) +
        (user._count.treatmentsCreated * 3) +
        (user._count.medicalRecordsCreated * 2) +
        (user._count.notesCreated * 1)

      return {
        ...user,
        activityScore,
        totalActivities: Object.values(user._count).reduce((sum, count) => sum + count, 0)
      }
    }).sort((a, b) => b.activityScore - a.activityScore)

    // Growth calculation (compare with previous period)
    const previousStartDate = new Date(startDate)
    previousStartDate.setMonth(previousStartDate.getMonth() - 1)
    const previousEndDate = new Date(startDate)

    const previousNewUsers = await prisma.user.count({
      where: {
        createdAt: { gte: previousStartDate, lte: previousEndDate }
      }
    })

    const growthRate = previousNewUsers > 0 
      ? ((newUsers - previousNewUsers) / previousNewUsers * 100) 
      : newUsers > 0 ? 100 : 0

    const stats = {
      overview: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        newUsers,
        growthRate,
        loginRate: Math.round(loginRate)
      },
      
      distribution: {
        byRole: roleDistribution,
        byStatus: [
          { status: 'active', count: activeUsers, percentage: Math.round((activeUsers / totalUsers) * 100) },
          { status: 'inactive', count: inactiveUsers, percentage: Math.round((inactiveUsers / totalUsers) * 100) }
        ]
      },

      activity: {
        recentLogins: recentActivity,
        topActiveUsers: topUsersWithActivity,
        usersWithRecentActivity: usersWithRecentLogin
      },

      period: {
        label: period,
        startDate,
        endDate
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul des statistiques' },
      { status: 500 }
    )
  }
} 
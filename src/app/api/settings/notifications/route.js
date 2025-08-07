import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/settings/notifications - Récupérer les paramètres de notification
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
    const userId = searchParams.get('userId') || session.user.id

    // Seuls les admins peuvent voir les paramètres des autres utilisateurs
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    let notificationSettings = await prisma.notificationSettings.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    // Créer des paramètres par défaut si ils n'existent pas
    if (!notificationSettings) {
      notificationSettings = await prisma.notificationSettings.create({
        data: {
          userId,
          appointmentReminders: true,
          emailNotifications: true,
          pushNotifications: false,
          reminderTime: 24,
          weeklyReports: true,
          monthlyReports: true
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      })
    }

    return NextResponse.json({ notificationSettings })

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// POST /api/settings/notifications - Mettre à jour les paramètres de notification
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
    const { 
      userId = session.user.id,
      appointmentReminders,
      emailNotifications,
      pushNotifications,
      reminderTime,
      weeklyReports,
      monthlyReports
    } = body

    // Seuls les admins peuvent modifier les paramètres des autres utilisateurs
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Validation des données
    if (reminderTime !== undefined && (reminderTime < 1 || reminderTime > 168)) {
      return NextResponse.json(
        { error: 'Le temps de rappel doit être entre 1 et 168 heures' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userExists) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const updateData = {}
    if (appointmentReminders !== undefined) updateData.appointmentReminders = Boolean(appointmentReminders)
    if (emailNotifications !== undefined) updateData.emailNotifications = Boolean(emailNotifications)
    if (pushNotifications !== undefined) updateData.pushNotifications = Boolean(pushNotifications)
    if (reminderTime !== undefined) updateData.reminderTime = parseInt(reminderTime)
    if (weeklyReports !== undefined) updateData.weeklyReports = Boolean(weeklyReports)
    if (monthlyReports !== undefined) updateData.monthlyReports = Boolean(monthlyReports)

    const notificationSettings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        appointmentReminders: appointmentReminders !== undefined ? Boolean(appointmentReminders) : true,
        emailNotifications: emailNotifications !== undefined ? Boolean(emailNotifications) : true,
        pushNotifications: pushNotifications !== undefined ? Boolean(pushNotifications) : false,
        reminderTime: reminderTime !== undefined ? parseInt(reminderTime) : 24,
        weeklyReports: weeklyReports !== undefined ? Boolean(weeklyReports) : true,
        monthlyReports: monthlyReports !== undefined ? Boolean(monthlyReports) : true
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Paramètres de notification mis à jour avec succès',
      notificationSettings
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/notifications - Réinitialiser aux valeurs par défaut
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId = session.user.id } = body

    // Seuls les admins peuvent réinitialiser les paramètres des autres utilisateurs
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const notificationSettings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        appointmentReminders: true,
        emailNotifications: true,
        pushNotifications: false,
        reminderTime: 24,
        weeklyReports: true,
        monthlyReports: true
      },
      create: {
        userId,
        appointmentReminders: true,
        emailNotifications: true,
        pushNotifications: false,
        reminderTime: 24,
        weeklyReports: true,
        monthlyReports: true
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Paramètres réinitialisés aux valeurs par défaut',
      notificationSettings
    })

  } catch (error) {
    console.error('Erreur lors de la réinitialisation des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation des paramètres' },
      { status: 500 }
    )
  }
}

// DELETE /api/settings/notifications - Supprimer les paramètres de notification
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    await prisma.notificationSettings.delete({
      where: { userId }
    })

    return NextResponse.json({
      message: 'Paramètres de notification supprimés avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des paramètres' },
      { status: 500 }
    )
  }
} 
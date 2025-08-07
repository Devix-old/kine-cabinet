import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST /api/users/bulk - Bulk operations on users
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { action, userIds } = body

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Action et liste d\'utilisateurs requises' },
        { status: 400 }
      )
    }

    // Empêcher l'utilisateur actuel de se modifier lui-même
    if (userIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre compte' },
        { status: 400 }
      )
    }

    // Vérifier que tous les utilisateurs existent
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, isActive: true }
    })

    if (existingUsers.length !== userIds.length) {
      return NextResponse.json(
        { error: 'Certains utilisateurs n\'existent pas' },
        { status: 404 }
      )
    }

    let updatedUsers = []
    let message = ''

    switch (action) {
      case 'activate':
        updatedUsers = await prisma.user.updateMany({
          where: { 
            id: { in: userIds },
            isActive: false // Ne mettre à jour que ceux qui sont inactifs
          },
          data: { isActive: true }
        })
        message = `${updatedUsers.count} utilisateur(s) activé(s) avec succès`
        break

      case 'deactivate':
        updatedUsers = await prisma.user.updateMany({
          where: { 
            id: { in: userIds },
            isActive: true // Ne mettre à jour que ceux qui sont actifs
          },
          data: { isActive: false }
        })
        message = `${updatedUsers.count} utilisateur(s) désactivé(s) avec succès`
        break

      case 'delete':
        // Soft delete - désactiver les utilisateurs
        updatedUsers = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false }
        })
        message = `${updatedUsers.count} utilisateur(s) supprimé(s) avec succès`
        break

      default:
        return NextResponse.json(
          { error: 'Action non supportée. Actions disponibles: activate, deactivate, delete' },
          { status: 400 }
        )
    }

    // Récupérer les utilisateurs mis à jour pour retourner les détails
    const finalUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message,
      action,
      affected: updatedUsers.count,
      users: finalUsers
    })

  } catch (error) {
    console.error('Erreur lors de l\'opération bulk:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'opération bulk' },
      { status: 500 }
    )
  }
} 
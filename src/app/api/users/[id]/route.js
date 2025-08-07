import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'

// GET - Récupérer un utilisateur spécifique
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            appointmentsCreated: true,
            appointmentsAssigned: true,
            treatmentsCreated: true,
            medicalRecordsCreated: true,
            notesCreated: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un utilisateur
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { email, name, role, password, isActive } = body

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher la modification de son propre compte par sécurité
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre compte' },
        { status: 400 }
      )
    }

    // Vérifier l'unicité de l'email si modifié
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }
    }

    // Préparer les données de mise à jour
    const updateData = {
      ...(email && { email }),
      ...(name && { name }),
      ...(role && { role }),
      ...(typeof isActive === 'boolean' && { isActive })
    }

    // Hasher le nouveau mot de passe si fourni
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un utilisateur (soft delete)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher la suppression de son propre compte
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      )
    }

    // Soft delete : désactiver l'utilisateur
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    return NextResponse.json({ 
      message: 'Utilisateur désactivé avec succès',
      user 
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 
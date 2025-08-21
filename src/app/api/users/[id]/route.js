import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'

// GET - Récupérer un utilisateur spécifique
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
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
        cabinetId: true,
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

    // Tenant isolation: only SUPER_ADMIN can access cross-tenant resources
    if (session.user.role !== 'SUPER_ADMIN' && user.cabinetId !== session.user.cabinetId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
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

// PUT /api/users/[id] - Modifier un utilisateur
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true, cabinetId: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Tenant isolation: only SUPER_ADMIN can update cross-tenant users
    if (session.user.role !== 'SUPER_ADMIN' && existingUser.cabinetId !== session.user.cabinetId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Validation des données
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Nom et email requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (body.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: { 
          email: body.email,
          id: { not: id },
          // Ensure uniqueness check is within the same tenant
          cabinetId: existingUser.cabinetId
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé par un autre utilisateur' },
          { status: 409 }
        )
      }
    }

    // Préparer les données de mise à jour
    const updateData = {
      name: body.name,
      email: body.email,
      role: body.role || existingUser.role,
      isActive: body.isActive !== undefined ? body.isActive : existingUser.isActive
    }

    // Hasher le mot de passe seulement s'il est fourni
    if (body.password && body.password.trim() !== '') {
      if (body.password.length < 6) {
        return NextResponse.json(
          { error: 'Le mot de passe doit contenir au moins 6 caractères' },
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un utilisateur (soft delete)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id } = params

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, cabinetId: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Tenant isolation: only SUPER_ADMIN can delete cross-tenant users
    if (session.user.role !== 'SUPER_ADMIN' && existingUser.cabinetId !== session.user.cabinetId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
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
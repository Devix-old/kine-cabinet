import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { name, email } = await request.json()

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nom et email sont requis' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: session.user.id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cabinetId: true
      }
    })

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

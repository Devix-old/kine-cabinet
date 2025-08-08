import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'

// GET - Récupérer les utilisateurs
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    // Construire les filtres selon le rôle de l'utilisateur
    let where = {
      isActive: true
    }

    // Si c'est un SUPER_ADMIN, il peut voir tous les utilisateurs
    if (session.user.role === 'SUPER_ADMIN') {
      // Pas de filtre par cabinet
    } else {
      // Les autres utilisateurs ne voient que les utilisateurs de leur cabinet
      where.cabinetId = session.user.cabinetId
    }

    // Ajouter le filtre par rôle si spécifié
    if (role) {
      where.role = role
    }

    // Compter le total
    const total = await prisma.user.count({ where })

    // Récupérer les utilisateurs
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        cabinet: {
          select: {
            id: true,
            nom: true
          }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    })

    return NextResponse.json({ 
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, role, password, isActive = true } = body

    // Validation
    if (!email || !name || !role || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà dans le même cabinet
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        cabinetId: session.user.cabinetId
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé dans votre cabinet' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: hashedPassword,
        isActive,
        cabinetId: session.user.cabinetId // Assigner au cabinet de l'admin
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        cabinet: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    })

    return NextResponse.json({ user }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 
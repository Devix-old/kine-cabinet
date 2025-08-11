import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'

// GET /api/admin/cabinets - Récupérer tous les cabinets (super admin seulement)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est connecté et est super admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const cabinets = await prisma.cabinet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            appointments: true
          }
        }
      }
    })

    return NextResponse.json({ cabinets })

  } catch (error) {
    console.error('Erreur lors de la récupération des cabinets:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/admin/cabinets - Créer un nouveau cabinet avec son admin
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est connecté et est super admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const body = await request.json()

    // Validation des données
    if (!body.nom || !body.adminName || !body.adminEmail || !body.adminPassword) {
      return NextResponse.json(
        { error: 'Nom du cabinet, nom admin, email admin et mot de passe requis' },
        { status: 400 }
      )
    }

    // Vérifier si le nom du cabinet existe déjà
    const existingCabinet = await prisma.cabinet.findUnique({
      where: { nom: body.nom }
    })

    if (existingCabinet) {
      return NextResponse.json(
        { error: 'Un cabinet avec ce nom existe déjà' },
        { status: 409 }
      )
    }

    // Vérifier si l'email admin existe déjà (globalement)
    const existingAdmin = await prisma.user.findFirst({
      where: { email: body.adminEmail }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé par un autre utilisateur' },
        { status: 409 }
      )
    }

    // Créer le cabinet et l'administrateur en transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le cabinet
      const cabinet = await tx.cabinet.create({
        data: {
          nom: body.nom,
          adresse: body.adresse || null,
          telephone: body.telephone || null,
          email: body.email || null,
          siret: body.siret || null,
          isActive: true
        }
      })

      // 2. Hasher le mot de passe de l'admin
      const hashedPassword = await bcrypt.hash(body.adminPassword, 10)

      // 3. Créer l'administrateur du cabinet
      const admin = await tx.user.create({
        data: {
          name: body.adminName,
          email: body.adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          cabinetId: cabinet.id
        }
      })

      return { cabinet, admin }
    })


    return NextResponse.json({
      message: 'Cabinet créé avec succès',
      cabinet: result.cabinet,
      admin: {
        id: result.admin.id,
        name: result.admin.name,
        email: result.admin.email,
        role: result.admin.role
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création du cabinet:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un cabinet avec ce nom ou cet email existe déjà' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du cabinet' },
      { status: 500 }
    )
  }
} 
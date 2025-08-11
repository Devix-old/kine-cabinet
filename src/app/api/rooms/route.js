import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/rooms - Récupérer toutes les salles
export async function GET(request) {
  try {
    // Rooms API: GET request
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Construire les filtres selon le rôle de l'utilisateur
    let where = {
      isActive: true
    }

    // Si c'est un SUPER_ADMIN, il peut voir toutes les salles
    if (session.user.role === 'SUPER_ADMIN') {
      // Pas de filtre par cabinet
    } else {
      // Les autres utilisateurs ne voient que les salles de leur cabinet
      where.cabinetId = session.user.cabinetId
    }
    
    const rooms = await prisma.room.findMany({
      where,
      orderBy: { nom: 'asc' }
    })

    // Rooms retrieved successfully
    return NextResponse.json(rooms)

  } catch (error) {
    console.error('❌ Rooms API: Erreur GET:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des salles' },
      { status: 500 }
    )
  }
}

// POST /api/rooms - Créer une nouvelle salle
export async function POST(request) {
  try {
    console.log('🔍 Rooms API: POST request - Connexion automatique Prisma')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const body = await request.json()
    
    if (!body.nom) {
      return NextResponse.json(
        { error: 'Nom de la salle requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a un cabinetId (sauf pour SUPER_ADMIN)
    if (session.user.role !== 'SUPER_ADMIN' && !session.user.cabinetId) {
      return NextResponse.json(
        { error: 'Utilisateur non associé à un cabinet' },
        { status: 400 }
      )
    }

    // Vérifier si une salle avec le même nom existe déjà dans le même cabinet
    const existingRoom = await prisma.room.findFirst({
      where: { 
        nom: body.nom,
        isActive: true,
        cabinetId: session.user.cabinetId
      }
    })

    if (existingRoom) {
      return NextResponse.json(
        { error: `Une salle avec le nom "${body.nom}" existe déjà dans votre cabinet` },
        { status: 409 }
      )
    }

    const room = await prisma.room.create({
      data: {
        nom: body.nom,
        description: body.description,
        capacite: body.capacite || 1,
        cabinetId: session.user.cabinetId // Assigner au cabinet de l'utilisateur
      }
    })

    console.log('✅ Rooms API: Salle créée avec succès, ID:', room.id)
    return NextResponse.json(room, { status: 201 })

  } catch (error) {
    console.error('❌ Rooms API: Erreur POST:', error)
    
    // Gérer spécifiquement l'erreur de contrainte d'unicité
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `Une salle avec le nom "${body.nom}" existe déjà dans votre cabinet` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la salle' },
      { status: 500 }
    )
  }
}
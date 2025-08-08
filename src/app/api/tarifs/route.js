import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/tarifs - Récupérer tous les tarifs
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Construire les filtres selon le rôle de l'utilisateur
    let where = {
      isActive: true
    }

    // Si c'est un SUPER_ADMIN, il peut voir tous les tarifs
    if (session.user.role === 'SUPER_ADMIN') {
      // Pas de filtre par cabinet
    } else {
      // Les autres utilisateurs ne voient que les tarifs de leur cabinet
      where.cabinetId = session.user.cabinetId
    }

    const tarifs = await prisma.tarif.findMany({
      where,
      orderBy: { nom: 'asc' }
    })

    return NextResponse.json(tarifs)

  } catch (error) {
    console.error('Erreur lors de la récupération des tarifs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tarifs' },
      { status: 500 }
    )
  }
}

// POST /api/tarifs - Créer un nouveau tarif
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.nom || !body.montant) {
      return NextResponse.json(
        { error: 'Nom et montant requis' },
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

    // Vérifier si un tarif avec le même nom existe déjà dans le même cabinet
    const existingTarif = await prisma.tarif.findFirst({
      where: { 
        nom: body.nom,
        isActive: true,
        cabinetId: session.user.cabinetId
      }
    })

    if (existingTarif) {
      return NextResponse.json(
        { error: `Un tarif avec le nom "${body.nom}" existe déjà dans votre cabinet` },
        { status: 409 }
      )
    }

    const tarif = await prisma.tarif.create({
      data: {
        nom: body.nom,
        description: body.description,
        montant: parseFloat(body.montant),
        duree: body.duree ? parseInt(body.duree) : null,
        cabinetId: session.user.cabinetId // Assigner au cabinet de l'utilisateur
      }
    })

    return NextResponse.json(tarif, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du tarif:', error)
    
    // Gérer spécifiquement l'erreur de contrainte d'unicité
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `Un tarif avec le nom "${body.nom}" existe déjà dans votre cabinet` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du tarif' },
      { status: 500 }
    )
  }
} 
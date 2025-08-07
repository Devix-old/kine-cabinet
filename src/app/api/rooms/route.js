import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/rooms - Récupérer toutes les salles
export async function GET() {
  try {
    // Force fresh database connection
    await prisma.$connect()
    
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      orderBy: { nom: 'asc' }
    })

    return NextResponse.json(rooms)

  } catch (error) {
    console.error('Erreur lors de la récupération des salles:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des salles' },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError)
    }
  }
}

// POST /api/rooms - Créer une nouvelle salle
export async function POST(request) {
  try {
    // Force fresh database connection
    await prisma.$connect()
    
    const body = await request.json()
    
    if (!body.nom) {
      return NextResponse.json(
        { error: 'Nom de la salle requis' },
        { status: 400 }
      )
    }

    const room = await prisma.room.create({
      data: {
        nom: body.nom,
        description: body.description,
        capacite: body.capacite || 1
      }
    })

    return NextResponse.json(room, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la salle:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la salle' },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError)
    }
  }
}
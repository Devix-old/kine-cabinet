import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/rooms/[id] - Supprimer une salle
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    // Vérifier si la salle existe
    const room = await prisma.room.findUnique({
      where: { id }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Salle non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer la salle (soft delete en mettant isActive à false)
    await prisma.room.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Salle supprimée avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression de la salle:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la salle' },
      { status: 500 }
    )
  }
}

// PUT /api/rooms/[id] - Modifier une salle
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Vérifier si la salle existe
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    })

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Salle non trouvée' },
        { status: 404 }
      )
    }

    // Validation des données
    if (!body.nom) {
      return NextResponse.json(
        { error: 'Nom de la salle requis' },
        { status: 400 }
      )
    }

    // Vérifier si une autre salle avec le même nom existe déjà
    if (body.nom !== existingRoom.nom) {
      const nameExists = await prisma.room.findFirst({
        where: { 
          nom: body.nom,
          isActive: true,
          id: { not: id }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { error: `Une salle avec le nom "${body.nom}" existe déjà` },
          { status: 409 }
        )
      }
    }

    // Mettre à jour la salle
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        nom: body.nom,
        description: body.description || existingRoom.description,
        capacite: body.capacite || existingRoom.capacite,
        isActive: body.isActive !== undefined ? body.isActive : existingRoom.isActive
      }
    })

    return NextResponse.json(updatedRoom)

  } catch (error) {
    console.error('Erreur lors de la modification de la salle:', error)
    
    // Gérer spécifiquement l'erreur de contrainte d'unicité
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `Une salle avec le nom "${body.nom}" existe déjà` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la salle' },
      { status: 500 }
    )
  }
} 
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/tarifs/[id] - Supprimer un tarif
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    // Vérifier si le tarif existe
    const tarif = await prisma.tarif.findUnique({
      where: { id }
    })

    if (!tarif) {
      return NextResponse.json(
        { error: 'Tarif non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le tarif (soft delete en mettant isActive à false)
    await prisma.tarif.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Tarif supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression du tarif:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du tarif' },
      { status: 500 }
    )
  }
}

// PUT /api/tarifs/[id] - Modifier un tarif
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Vérifier si le tarif existe
    const existingTarif = await prisma.tarif.findUnique({
      where: { id }
    })

    if (!existingTarif) {
      return NextResponse.json(
        { error: 'Tarif non trouvé' },
        { status: 404 }
      )
    }

    // Validation des données
    if (!body.nom || !body.montant) {
      return NextResponse.json(
        { error: 'Nom et montant requis' },
        { status: 400 }
      )
    }

    // Vérifier si un autre tarif avec le même nom existe déjà
    if (body.nom !== existingTarif.nom) {
      const nameExists = await prisma.tarif.findFirst({
        where: { 
          nom: body.nom,
          isActive: true,
          id: { not: id }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { error: `Un tarif avec le nom "${body.nom}" existe déjà` },
          { status: 409 }
        )
      }
    }

    // Mettre à jour le tarif
    const updatedTarif = await prisma.tarif.update({
      where: { id },
      data: {
        nom: body.nom,
        description: body.description || existingTarif.description,
        montant: parseFloat(body.montant),
        duree: body.duree ? parseInt(body.duree) : existingTarif.duree,
        isActive: body.isActive !== undefined ? body.isActive : existingTarif.isActive
      }
    })

    return NextResponse.json(updatedTarif)

  } catch (error) {
    console.error('Erreur lors de la modification du tarif:', error)
    
    // Gérer spécifiquement l'erreur de contrainte d'unicité
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `Un tarif avec le nom "${body.nom}" existe déjà` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la modification du tarif' },
      { status: 500 }
    )
  }
} 
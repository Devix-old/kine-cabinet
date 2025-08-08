nimport { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/test - Récupérer tous les tests
export async function GET() {
  try {
    const tests = await prisma.test.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ tests })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tests' },
      { status: 500 }
    )
  }
}

// POST /api/test - Créer un nouveau test
export async function POST(request) {
  try {
    const body = await request.json()
    
    if (!body.nom || !body.description) {
      return NextResponse.json(
        { error: 'Nom et description sont requis' },
        { status: 400 }
      )
    }

    const test = await prisma.test.create({
      data: {
        nom: body.nom,
        description: body.description,
        statut: body.statut || 'ACTIF',
        valeur: body.valeur || 0
      }
    })
    
    return NextResponse.json(test, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création du test' },
      { status: 500 }
    )
  }
}

// PUT /api/test/[id] - Modifier un test
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du test requis' },
        { status: 400 }
      )
    }

    const test = await prisma.test.update({
      where: { id },
      data: {
        nom: body.nom,
        description: body.description,
        statut: body.statut,
        valeur: body.valeur
      }
    })
    
    return NextResponse.json(test)

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la modification du test' },
      { status: 500 }
    )
  }
}

// DELETE /api/test/[id] - Supprimer un test
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du test requis' },
        { status: 400 }
      )
    }

    await prisma.test.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Test supprimé avec succès' })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du test' },
      { status: 500 }
    )
  }
} 
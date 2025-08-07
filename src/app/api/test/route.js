import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/test - Récupérer tous les tests
export async function GET() {
  try {
    console.log('🔍 Test API: GET request - Connexion automatique Prisma')
    
    // Prisma se connecte automatiquement au premier appel
    const tests = await prisma.test.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('🔍 Test API: Données récupérées, count:', tests.length)
    return NextResponse.json({ tests })

  } catch (error) {
    console.error('❌ Test API: Erreur GET:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tests' },
      { status: 500 }
    )
  }
}

// POST /api/test - Créer un nouveau test
export async function POST(request) {
  try {
    console.log('🔍 Test API: POST request - Connexion automatique Prisma')
    
    const body = await request.json()
    
    if (!body.nom || !body.description) {
      return NextResponse.json(
        { error: 'Nom et description sont requis' },
        { status: 400 }
      )
    }

    // Prisma se connecte automatiquement
    const test = await prisma.test.create({
      data: {
        nom: body.nom,
        description: body.description,
        statut: body.statut || 'ACTIF',
        valeur: body.valeur || 0
      }
    })
    
    console.log('🔍 Test API: Test créé avec succès, ID:', test.id)
    return NextResponse.json(test, { status: 201 })

  } catch (error) {
    console.error('❌ Test API: Erreur POST:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du test' },
      { status: 500 }
    )
  }
}

// PUT /api/test/[id] - Modifier un test
export async function PUT(request) {
  try {
    console.log('🔍 Test API: PUT request - Connexion automatique Prisma')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du test requis' },
        { status: 400 }
      )
    }

    // Prisma se connecte automatiquement
    const test = await prisma.test.update({
      where: { id },
      data: {
        nom: body.nom,
        description: body.description,
        statut: body.statut,
        valeur: body.valeur
      }
    })
    
    console.log('🔍 Test API: Test modifié avec succès, ID:', test.id)
    return NextResponse.json(test)

  } catch (error) {
    console.error('❌ Test API: Erreur PUT:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification du test' },
      { status: 500 }
    )
  }
}

// DELETE /api/test/[id] - Supprimer un test
export async function DELETE(request) {
  try {
    console.log('🔍 Test API: DELETE request - Connexion automatique Prisma')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du test requis' },
        { status: 400 }
      )
    }

    // Prisma se connecte automatiquement
    await prisma.test.delete({
      where: { id }
    })
    
    console.log('🔍 Test API: Test supprimé avec succès, ID:', id)
    return NextResponse.json({ message: 'Test supprimé avec succès' })

  } catch (error) {
    console.error('❌ Test API: Erreur DELETE:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du test' },
      { status: 500 }
    )
  }
} 
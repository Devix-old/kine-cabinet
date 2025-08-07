import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tarifs - Récupérer tous les tarifs
export async function GET() {
  try {
    const tarifs = await prisma.tarif.findMany({
      where: { isActive: true },
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
    const body = await request.json()
    
    if (!body.nom || !body.montant) {
      return NextResponse.json(
        { error: 'Nom et montant requis' },
        { status: 400 }
      )
    }

    const tarif = await prisma.tarif.create({
      data: {
        nom: body.nom,
        description: body.description,
        montant: parseFloat(body.montant),
        duree: body.duree ? parseInt(body.duree) : null
      }
    })

    return NextResponse.json(tarif, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du tarif:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du tarif' },
      { status: 500 }
    )
  }
} 
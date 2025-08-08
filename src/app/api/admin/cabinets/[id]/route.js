import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/admin/cabinets/[id] - Récupérer un cabinet spécifique
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est connecté et est super admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { id } = params

    const cabinet = await prisma.cabinet.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            appointments: true,
            rooms: true,
            tarifs: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!cabinet) {
      return NextResponse.json(
        { error: 'Cabinet non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ cabinet })

  } catch (error) {
    console.error('Erreur lors de la récupération du cabinet:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/cabinets/[id] - Modifier un cabinet
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est connecté et est super admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Vérifier si le cabinet existe
    const existingCabinet = await prisma.cabinet.findUnique({
      where: { id }
    })

    if (!existingCabinet) {
      return NextResponse.json(
        { error: 'Cabinet non trouvé' },
        { status: 404 }
      )
    }

    // Validation des données
    if (!body.nom) {
      return NextResponse.json(
        { error: 'Nom du cabinet requis' },
        { status: 400 }
      )
    }

    // Vérifier si le nom existe déjà (sauf pour ce cabinet)
    if (body.nom !== existingCabinet.nom) {
      const nameExists = await prisma.cabinet.findFirst({
        where: { 
          nom: body.nom,
          id: { not: id }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'Un cabinet avec ce nom existe déjà' },
          { status: 409 }
        )
      }
    }

    // Mettre à jour le cabinet
    const updatedCabinet = await prisma.cabinet.update({
      where: { id },
      data: {
        nom: body.nom,
        adresse: body.adresse || null,
        telephone: body.telephone || null,
        email: body.email || null,
        siret: body.siret || null,
        isActive: body.isActive !== undefined ? body.isActive : existingCabinet.isActive
      }
    })

    return NextResponse.json({
      message: 'Cabinet modifié avec succès',
      cabinet: updatedCabinet
    })

  } catch (error) {
    console.error('Erreur lors de la modification du cabinet:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un cabinet avec ce nom existe déjà' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la modification du cabinet' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/cabinets/[id] - Supprimer un cabinet
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est connecté et est super admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { id } = params

    // Vérifier si le cabinet existe
    const existingCabinet = await prisma.cabinet.findUnique({
      where: { id },
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

    if (!existingCabinet) {
      return NextResponse.json(
        { error: 'Cabinet non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier s'il y a des données associées
    const hasData = existingCabinet._count.users > 0 || 
                   existingCabinet._count.patients > 0 || 
                   existingCabinet._count.appointments > 0

    if (hasData) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un cabinet qui contient des données. Désactivez-le à la place.' },
        { status: 400 }
      )
    }

    // Supprimer le cabinet (cascade supprimera automatiquement les données associées)
    await prisma.cabinet.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Cabinet supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du cabinet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du cabinet' },
      { status: 500 }
    )
  }
} 
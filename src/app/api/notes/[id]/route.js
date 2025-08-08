import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/notes/[id] - Récupérer une note spécifique
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = params

    // Construire la requête selon le rôle de l'utilisateur
    let where = { id }
    
    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role !== 'SUPER_ADMIN') {
      where.cabinetId = session.user.cabinetId
    }

    const note = await prisma.note.findFirst({
      where,
      include: {
        patient: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroDossier: true,
            dateNaissance: true,
            sexe: true
          }
        },
        treatment: {
          select: {
            id: true,
            nom: true,
            statut: true,
            description: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    if (!note) {
      return NextResponse.json(
        { error: 'Note non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(note)

  } catch (error) {
    console.error('Erreur lors de la récupération de la note:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération de la note' },
      { status: 500 }
    )
  }
}

// PUT /api/notes/[id] - Mettre à jour une note
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { titre, contenu, type, isPrivee } = body

    // Construire la requête selon le rôle de l'utilisateur
    let where = { id }
    
    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role !== 'SUPER_ADMIN') {
      where.cabinetId = session.user.cabinetId
    }

    // Vérifier que la note existe
    const existingNote = await prisma.note.findFirst({
      where,
      include: {
        createdBy: {
          select: { id: true }
        }
      }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur peut modifier cette note (créateur ou admin)
    if (existingNote.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé à modifier cette note' },
        { status: 403 }
      )
    }

    // Mettre à jour la note
    const note = await prisma.note.update({
      where: { id },
      data: {
        titre,
        contenu,
        type,
        isPrivee
      },
      include: {
        patient: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroDossier: true
          }
        },
        treatment: {
          select: {
            id: true,
            nom: true,
            statut: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(note)

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour de la note' },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/[id] - Supprimer une note
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = params

    // Construire la requête selon le rôle de l'utilisateur
    let where = { id }
    
    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role !== 'SUPER_ADMIN') {
      where.cabinetId = session.user.cabinetId
    }

    // Vérifier que la note existe
    const existingNote = await prisma.note.findFirst({
      where,
      include: {
        createdBy: {
          select: { id: true }
        }
      }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur peut supprimer cette note (créateur ou admin)
    if (existingNote.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer cette note' },
        { status: 403 }
      )
    }

    // Supprimer la note
    await prisma.note.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Note supprimée avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression de la note' },
      { status: 500 }
    )
  }
} 
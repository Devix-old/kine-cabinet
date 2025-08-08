import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/medical-records/[id] - Récupérer un dossier médical spécifique
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

    const medicalRecord = await prisma.medicalRecord.findFirst({
      where,
      include: {
        patient: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroDossier: true,
            dateNaissance: true,
            sexe: true,
            telephone: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!medicalRecord) {
      return NextResponse.json(
        { error: 'Dossier médical non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(medicalRecord)

  } catch (error) {
    console.error('Erreur lors de la récupération du dossier médical:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du dossier médical' },
      { status: 500 }
    )
  }
}

// PUT /api/medical-records/[id] - Mettre à jour un dossier médical
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
    const { titre, description, type, contenu, date } = body

    // Construire la requête selon le rôle de l'utilisateur
    let where = { id }
    
    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role !== 'SUPER_ADMIN') {
      where.cabinetId = session.user.cabinetId
    }

    // Vérifier que le dossier médical existe
    const existingRecord = await prisma.medicalRecord.findFirst({
      where
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Dossier médical non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le dossier médical
    const medicalRecord = await prisma.medicalRecord.update({
      where: { id },
      data: {
        titre,
        description,
        type,
        contenu,
        date: date ? new Date(date) : existingRecord.date
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
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        documents: true
      }
    })

    return NextResponse.json(medicalRecord)

  } catch (error) {
    console.error('Erreur lors de la mise à jour du dossier médical:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du dossier médical' },
      { status: 500 }
    )
  }
}

// DELETE /api/medical-records/[id] - Supprimer un dossier médical
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

    // Vérifier que le dossier médical existe
    const existingRecord = await prisma.medicalRecord.findFirst({
      where
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Dossier médical non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le dossier médical (et documents associés grâce à onDelete: Cascade)
    await prisma.medicalRecord.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Dossier médical supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression du dossier médical:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression du dossier médical' },
      { status: 500 }
    )
  }
} 
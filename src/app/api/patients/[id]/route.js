import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/patients/[id] - Récupérer un patient spécifique
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 5,
          include: {
            kine: {
              select: { name: true, email: true }
            },
            salle: {
              select: { nom: true }
            }
          }
        },
        treatments: {
          orderBy: { dateDebut: 'desc' },
          take: 5,
          include: {
            createdBy: {
              select: { name: true }
            },
            _count: {
              select: { sessions: true }
            }
          }
        },
        medicalRecords: {
          orderBy: { date: 'desc' },
          take: 5,
          include: {
            createdBy: {
              select: { name: true }
            }
          }
        },
        _count: {
          select: {
            appointments: true,
            treatments: true,
            medicalRecords: true,
            documents: true,
            notes: true
          }
        }
      }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)

  } catch (error) {
    console.error('Erreur lors de la récupération du patient:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du patient' },
      { status: 500 }
    )
  }
}

// PUT /api/patients/[id] - Mettre à jour un patient
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validation des données requises
    if (!body.nom || !body.prenom || !body.dateNaissance) {
      return NextResponse.json(
        { error: 'Nom, prénom et date de naissance sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le patient existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    })

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le patient
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        nom: body.nom,
        prenom: body.prenom,
        dateNaissance: new Date(body.dateNaissance),
        sexe: body.sexe,
        telephone: body.telephone,
        email: body.email,
        adresse: body.adresse,
        ville: body.ville,
        codePostal: body.codePostal,
        pays: body.pays,
        profession: body.profession,
        medecinTraitant: body.medecinTraitant,
        antecedents: body.antecedents,
        allergies: body.allergies,
        notesGenerales: body.notesGenerales,
        cin: body.cin,
        isActive: body.isActive
      }
    })

    return NextResponse.json(patient)

  } catch (error) {
    console.error('Erreur lors de la mise à jour du patient:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du patient' },
      { status: 500 }
    )
  }
}

// DELETE /api/patients/[id] - Supprimer un patient (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    // Vérifier que le patient existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    })

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      )
    }

    // Soft delete - marquer comme inactif au lieu de supprimer
    const patient = await prisma.patient.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Patient supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression du patient:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du patient' },
      { status: 500 }
    )
  }
} 
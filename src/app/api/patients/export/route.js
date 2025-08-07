import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/patients/export - Exporter les patients en CSV
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')
    
    let where = {}
    
    // Si des IDs spécifiques sont fournis, les utiliser
    if (idsParam) {
      const ids = idsParam.split(',').filter(id => id.trim())
      if (ids.length > 0) {
        where.id = { in: ids }
      }
    }

    // Récupérer les patients avec toutes les données nécessaires
    const patients = await prisma.patient.findMany({
      where,
      include: {
        _count: {
          select: {
            appointments: true,
            treatments: true,
            medicalRecords: true,
            notes: true
          }
        },
        appointments: {
          take: 1,
          orderBy: { date: 'desc' },
          select: { date: true, statut: true }
        }
      },
      orderBy: { nom: 'asc' }
    })

    // Convertir en CSV
    const csvHeaders = [
      'Numéro Dossier',
      'Nom',
      'Prénom',
      'Date de Naissance',
      'Âge',
      'Sexe',
      'Téléphone',
      'Email',
      'Adresse',
      'Ville',
      'Code Postal',
      'Profession',
      'Médecin Traitant',
      'Statut',
      'Date de Création',
      'Dernier RDV',
      'Statut Dernier RDV',
      'Nombre RDV',
      'Nombre Traitements',
      'Nombre Dossiers Médicaux',
      'Nombre Notes',
      'Antécédents',
      'Allergies',
      'Notes Générales'
    ]

    const csvRows = patients.map(patient => {
      const age = patient.dateNaissance 
        ? new Date().getFullYear() - new Date(patient.dateNaissance).getFullYear()
        : ''
      
      const lastAppointment = patient.appointments[0]
      const lastAppointmentDate = lastAppointment 
        ? new Date(lastAppointment.date).toLocaleDateString('fr-FR')
        : ''
      
      const lastAppointmentStatus = lastAppointment?.statut || ''

      return [
        patient.numeroDossier || '',
        patient.nom || '',
        patient.prenom || '',
        patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : '',
        age,
        patient.sexe || '',
        patient.telephone || '',
        patient.email || '',
        patient.adresse || '',
        patient.ville || '',
        patient.codePostal || '',
        patient.profession || '',
        patient.medecinTraitant || '',
        patient.isActive ? 'Actif' : 'Inactif',
        new Date(patient.createdAt).toLocaleDateString('fr-FR'),
        lastAppointmentDate,
        lastAppointmentStatus,
        patient._count.appointments,
        patient._count.treatments,
        patient._count.medicalRecords,
        patient._count.notes,
        patient.antecedents || '',
        patient.allergies || '',
        patient.notesGenerales || ''
      ].map(field => {
        // Échapper les guillemets et entourer de guillemets si nécessaire
        const stringField = String(field)
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`
        }
        return stringField
      })
    })

    // Construire le CSV
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Ajouter BOM pour Excel
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    return new Response(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="patients_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'export des patients:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'export des patients' },
      { status: 500 }
    )
  }
} 
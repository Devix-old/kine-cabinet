import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateNumeroDossier } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/patients - Récupérer tous les patients
export async function GET(request) {
  try {
    console.log('🔍 Patients API: GET request - Connexion automatique Prisma')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    
    // Advanced filters
    const ageMin = searchParams.get('ageMin')
    const ageMax = searchParams.get('ageMax')
    const sexe = searchParams.get('sexe')
    const city = searchParams.get('city')
    const hasAppointments = searchParams.get('hasAppointments')
    const lastVisit = searchParams.get('lastVisit')
    const hasMedicalRecords = searchParams.get('hasMedicalRecords')
    const sortBy = searchParams.get('sortBy') || 'recent'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Construire la requête de recherche
    const where = {
      isActive: status === 'all' ? undefined : status === 'active'
    }

    // Filtrage par cabinet selon le rôle de l'utilisateur
    if (session.user.role === 'SUPER_ADMIN') {
      // Le super admin peut voir tous les patients
    } else {
      // Les autres utilisateurs ne voient que les patients de leur cabinet
      where.cabinetId = session.user.cabinetId
    }

    // Search in multiple fields
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { numeroDossier: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telephone: { contains: search, mode: 'insensitive' } },
        { ville: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Age filters
    if (ageMin || ageMax) {
      const currentYear = new Date().getFullYear()
      const conditions = []
      
      if (ageMin) {
        const maxBirthYear = currentYear - parseInt(ageMin)
        conditions.push({ 
          dateNaissance: { 
            lte: new Date(`${maxBirthYear}-12-31`) 
          } 
        })
      }
      
      if (ageMax) {
        const minBirthYear = currentYear - parseInt(ageMax)
        conditions.push({ 
          dateNaissance: { 
            gte: new Date(`${minBirthYear}-01-01`) 
          } 
        })
      }
      
      if (conditions.length > 0) {
        where.AND = (where.AND || []).concat(conditions)
      }
    }

    // Gender filter
    if (sexe && sexe !== 'all') {
      where.sexe = sexe
    }

    // City filter
    if (city) {
      where.ville = { contains: city, mode: 'insensitive' }
    }

    // Has appointments filter
    if (hasAppointments && hasAppointments !== 'all') {
      if (hasAppointments === 'yes') {
        where.appointments = { some: {} }
      } else {
        where.appointments = { none: {} }
      }
    }

    // Last visit filter
    if (lastVisit && lastVisit !== 'all') {
      const now = new Date()
      let dateFilter
      
      switch (lastVisit) {
        case 'week':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'quarter':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }
      
      if (dateFilter) {
        where.appointments = {
          some: {
            date: { gte: dateFilter }
          }
        }
      }
    }

    // Has medical records filter
    if (hasMedicalRecords && hasMedicalRecords !== 'all') {
      if (hasMedicalRecords === 'yes') {
        where.medicalRecords = { some: {} }
      } else {
        where.medicalRecords = { none: {} }
      }
    }

    // Determine sort order
    let orderBy = { createdAt: 'desc' } // default
    
    switch (sortBy) {
      case 'name':
        orderBy = { nom: sortOrder }
        break
      case 'age':
        orderBy = { dateNaissance: sortOrder === 'asc' ? 'desc' : 'asc' } // Reverse for age
        break
      case 'recent':
        orderBy = { createdAt: sortOrder }
        break
      case 'lastVisit':
        // This would need a subquery, for now use creation date
        orderBy = { createdAt: sortOrder }
        break
    }

    // Récupérer les patients avec pagination
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
        }
      }),
      prisma.patient.count({ where })
    ])

    // Add computed fields
    const enrichedPatients = patients.map(patient => ({
      ...patient,
      age: patient.dateNaissance 
        ? new Date().getFullYear() - new Date(patient.dateNaissance).getFullYear()
        : null,
      lastAppointment: patient.appointments[0] || null,
      hasRecentActivity: patient.appointments[0] 
        ? new Date(patient.appointments[0].date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : false
    }))

    const totalPages = Math.ceil(total / limit)

    console.log('✅ Patients API: Données récupérées, count:', patients.length)

    return NextResponse.json({
      patients: enrichedPatients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        applied: {
          search: search || null,
          status: status !== 'all' ? status : null,
          ageMin: ageMin || null,
          ageMax: ageMax || null,
          sexe: sexe !== 'all' ? sexe : null,
          city: city || null,
          hasAppointments: hasAppointments !== 'all' ? hasAppointments : null,
          lastVisit: lastVisit !== 'all' ? lastVisit : null,
          hasMedicalRecords: hasMedicalRecords !== 'all' ? hasMedicalRecords : null
        }
      }
    })

  } catch (error) {
    console.error('❌ Patients API: Erreur GET:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des patients' },
      { status: 500 }
    )
  }
}

// POST /api/patients - Créer un nouveau patient
export async function POST(request) {
  try {
    console.log(' Patients API: POST request - Connexion automatique Prisma')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validation des données requises
    if (!body.nom || !body.prenom || !body.dateNaissance) {
      return NextResponse.json(
        { error: 'Nom, prénom et date de naissance sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a un cabinetId (sauf pour SUPER_ADMIN)
    if (session.user.role !== 'SUPER_ADMIN' && !session.user.cabinetId) {
      return NextResponse.json(
        { error: 'Utilisateur non associé à un cabinet' },
        { status: 400 }
      )
    }

    // Générer un numéro de dossier unique dans le cabinet
    let numeroDossier
    let isUnique = false
    while (!isUnique) {
      numeroDossier = generateNumeroDossier()
      const existing = await prisma.patient.findFirst({
        where: { 
          numeroDossier,
          cabinetId: session.user.cabinetId
        }
      })
      if (!existing) {
        isUnique = true
      }
    }

    // Créer le patient
    const patient = await prisma.patient.create({
      data: {
        numeroDossier,
        nom: body.nom,
        prenom: body.prenom,
        dateNaissance: new Date(body.dateNaissance),
        sexe: body.sexe || 'AUTRE',
        telephone: body.telephone,
        email: body.email,
        adresse: body.adresse,
        ville: body.ville,
        codePostal: body.codePostal,
        pays: body.pays || 'France',
        profession: body.profession,
        medecinTraitant: body.medecinTraitant,
        antecedents: body.antecedents,
        allergies: body.allergies,
        notesGenerales: body.notesGenerales,
        cabinetId: session.user.cabinetId // Assigner au cabinet de l'utilisateur
      }
    })

    console.log('✅ Patients API: Patient créé avec succès, ID:', patient.id)
    return NextResponse.json(patient, { status: 201 })

  } catch (error) {
    console.error('❌ Patients API: Erreur POST:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du patient' },
      { status: 500 }
    )
  }
}
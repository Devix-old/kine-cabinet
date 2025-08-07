import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/settings/working-hours - Récupérer les horaires de travail
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const workingHours = await prisma.workingHours.findMany({
      orderBy: { dayOfWeek: 'asc' }
    })

    // Convertir en format plus lisible
    const formattedHours = {}
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    
    // Initialiser tous les jours
    dayNames.forEach((day, index) => {
      formattedHours[day] = {
        dayOfWeek: index,
        startTime: '08:00',
        endTime: '18:00',
        isActive: index >= 1 && index <= 5, // Lundi à Vendredi par défaut
        breakStartTime: null,
        breakEndTime: null
      }
    })

    // Appliquer les données de la base
    workingHours.forEach(wh => {
      const dayName = dayNames[wh.dayOfWeek]
      if (dayName) {
        formattedHours[dayName] = {
          id: wh.id,
          dayOfWeek: wh.dayOfWeek,
          startTime: wh.startTime,
          endTime: wh.endTime,
          isActive: wh.isActive,
          breakStartTime: wh.breakStartTime,
          breakEndTime: wh.breakEndTime
        }
      }
    })

    return NextResponse.json({ workingHours: formattedHours })

  } catch (error) {
    console.error('Erreur lors de la récupération des horaires:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des horaires' },
      { status: 500 }
    )
  }
}

// POST /api/settings/working-hours - Mettre à jour les horaires de travail
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { workingHours } = body

    if (!workingHours || typeof workingHours !== 'object') {
      return NextResponse.json(
        { error: 'Données d\'horaires invalides' },
        { status: 400 }
      )
    }

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const upsertPromises = []

    // Traiter chaque jour
    Object.keys(workingHours).forEach(dayName => {
      const dayIndex = dayNames.indexOf(dayName)
      if (dayIndex === -1) return

      const hours = workingHours[dayName]
      
      // Validation des heures
      if (hours.isActive && (!hours.startTime || !hours.endTime)) {
        throw new Error(`Heures de début et fin requises pour ${dayName}`)
      }

      // Validation du format d'heure
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (hours.isActive && (!timeRegex.test(hours.startTime) || !timeRegex.test(hours.endTime))) {
        throw new Error(`Format d'heure invalide pour ${dayName}`)
      }

      // Validation pause déjeuner
      if (hours.breakStartTime && hours.breakEndTime) {
        if (!timeRegex.test(hours.breakStartTime) || !timeRegex.test(hours.breakEndTime)) {
          throw new Error(`Format d'heure de pause invalide pour ${dayName}`)
        }
      }

      upsertPromises.push(
        prisma.workingHours.upsert({
          where: { dayOfWeek: dayIndex },
          update: {
            startTime: hours.startTime || '08:00',
            endTime: hours.endTime || '18:00',
            isActive: Boolean(hours.isActive),
            breakStartTime: hours.breakStartTime || null,
            breakEndTime: hours.breakEndTime || null
          },
          create: {
            dayOfWeek: dayIndex,
            startTime: hours.startTime || '08:00',
            endTime: hours.endTime || '18:00',
            isActive: Boolean(hours.isActive),
            breakStartTime: hours.breakStartTime || null,
            breakEndTime: hours.breakEndTime || null
          }
        })
      )
    })

    const updatedHours = await Promise.all(upsertPromises)

    return NextResponse.json({
      message: 'Horaires de travail mis à jour avec succès',
      workingHours: updatedHours
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des horaires:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour des horaires' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/working-hours - Mettre à jour un jour spécifique
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { dayOfWeek, startTime, endTime, isActive, breakStartTime, breakEndTime } = body

    if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: 'Jour de la semaine invalide (0-6)' },
        { status: 400 }
      )
    }

    // Validation des heures si le jour est actif
    if (isActive && (!startTime || !endTime)) {
      return NextResponse.json(
        { error: 'Heures de début et fin requises pour un jour actif' },
        { status: 400 }
      )
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (isActive && (!timeRegex.test(startTime) || !timeRegex.test(endTime))) {
      return NextResponse.json(
        { error: 'Format d\'heure invalide (HH:MM)' },
        { status: 400 }
      )
    }

    const workingHours = await prisma.workingHours.upsert({
      where: { dayOfWeek },
      update: {
        startTime: startTime || '08:00',
        endTime: endTime || '18:00',
        isActive: Boolean(isActive),
        breakStartTime: breakStartTime || null,
        breakEndTime: breakEndTime || null
      },
      create: {
        dayOfWeek,
        startTime: startTime || '08:00',
        endTime: endTime || '18:00',
        isActive: Boolean(isActive),
        breakStartTime: breakStartTime || null,
        breakEndTime: breakEndTime || null
      }
    })

    return NextResponse.json({
      message: 'Horaires mis à jour avec succès',
      workingHours
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des horaires:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des horaires' },
      { status: 500 }
    )
  }
} 
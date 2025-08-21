import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/settings - Récupérer tous les paramètres ou par catégorie
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Tenant isolation: SUPER_ADMIN can access all settings, others are scoped to their cabinet
    const cabinetId = session.user.role === 'SUPER_ADMIN' ? undefined : session.user.cabinetId

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const key = searchParams.get('key')

    // Si une clé spécifique est demandée
    if (key) {
      const where = { key }
      if (cabinetId !== undefined) {
        where.cabinetId = cabinetId
      }
      const setting = await prisma.settings.findFirst({ where })
      
      return NextResponse.json({ 
        setting: setting ? {
          ...setting,
          value: parseSettingValue(setting.value, setting.type)
        } : null
      })
    }

    // Filtrer par catégorie si spécifiée et par cabinet
    const where = {}
    if (cabinetId !== undefined) {
      where.cabinetId = cabinetId
    }
    if (category) {
      where.category = category
    }

    const settings = await prisma.settings.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // Grouper par catégorie et parser les valeurs
    const settingsByCategory = {}
    settings.forEach(setting => {
      if (!settingsByCategory[setting.category]) {
        settingsByCategory[setting.category] = {}
      }
      settingsByCategory[setting.category][setting.key] = parseSettingValue(setting.value, setting.type)
    })

    return NextResponse.json({ 
      settings: settingsByCategory,
      raw: settings
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// POST /api/settings - Créer ou mettre à jour des paramètres
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Tenant isolation: SUPER_ADMIN can create global settings, others create cabinet-specific settings
    const cabinetId = session.user.role === 'SUPER_ADMIN' ? 'GLOBAL' : session.user.cabinetId

    const body = await request.json()
    const { settings } = body

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Format de données invalide. Attendu: { settings: [] }' },
        { status: 400 }
      )
    }

    // Validation des paramètres
    for (const setting of settings) {
      if (!setting.key || setting.value === undefined) {
        return NextResponse.json(
          { error: 'Chaque paramètre doit avoir une clé et une valeur' },
          { status: 400 }
        )
      }
    }

    // Upsert chaque paramètre
    const upsertPromises = settings.map(setting => {
      const { key, value, type = 'STRING', description, category } = setting
      const stringValue = stringifySettingValue(value, type)

      return prisma.settings.upsert({
        where: { 
          key,
          cabinetId
        },
        update: {
          value: stringValue,
          type,
          description,
          category,
          cabinetId
        },
        create: {
          key,
          value: stringValue,
          type,
          description,
          category: category || 'general',
          cabinetId
        }
      })
    })

    const updatedSettings = await Promise.all(upsertPromises)

    return NextResponse.json({
      message: `${updatedSettings.length} paramètre(s) mis à jour avec succès`,
      settings: updatedSettings
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Mettre à jour un paramètre spécifique
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Tenant isolation: SUPER_ADMIN can update global settings, others update cabinet-specific settings
    const cabinetId = session.user.role === 'SUPER_ADMIN' ? 'GLOBAL' : session.user.cabinetId

    const body = await request.json()
    const { key, value, type = 'STRING', description, category } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Clé et valeur requises' },
        { status: 400 }
      )
    }

    const stringValue = stringifySettingValue(value, type)

    const setting = await prisma.settings.upsert({
      where: { 
        key,
        cabinetId
      },
      update: {
        value: stringValue,
        type,
        ...(description && { description }),
        ...(category && { category }),
        cabinetId
      },
      create: {
        key,
        value: stringValue,
        type,
        description,
        category: category || 'general',
        cabinetId
      }
    })

    return NextResponse.json({
      message: 'Paramètre mis à jour avec succès',
      setting: {
        ...setting,
        value: parseSettingValue(setting.value, setting.type)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du paramètre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du paramètre' },
      { status: 500 }
    )
  }
}

// Fonctions utilitaires pour parser et stringifier les valeurs
function parseSettingValue(value, type) {
  switch (type) {
    case 'INTEGER':
      return parseInt(value) || 0
    case 'BOOLEAN':
      return value === 'true' || value === true
    case 'JSON':
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    default:
      return value
  }
}

function stringifySettingValue(value, type) {
  switch (type) {
    case 'INTEGER':
      return String(parseInt(value) || 0)
    case 'BOOLEAN':
      return String(Boolean(value))
    case 'JSON':
      return JSON.stringify(value)
    default:
      return String(value)
  }
} 
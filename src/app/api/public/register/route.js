import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/public/register - Self-serve registration with trial
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      trialDays = 7,
      maxPatients = 3
    } = body || {}

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'email et password sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({ 
      where: { email } 
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Generate cabinet name from email
    const emailPrefix = email.split('@')[0]
    const cabinetName = `Cabinet ${emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)}`
    
    // Check if cabinet name exists and make it unique
    let finalCabinetName = cabinetName
    let counter = 1
    while (await prisma.cabinet.findUnique({ where: { nom: finalCabinetName } })) {
      finalCabinetName = `${cabinetName} ${counter}`
      counter++
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create cabinet and admin in a transaction with trial settings
    const result = await prisma.$transaction(async (tx) => {
      const cabinet = await tx.cabinet.create({
        data: {
          nom: finalCabinetName,
          adresse: null,
          telephone: null,
          email: email,
          siret: null,
          isActive: true,
          // Trial settings
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000), // +7 days
          isTrialActive: true,
          maxPatients: maxPatients, // Limit to 3 patients during trial
        },
      })

      const admin = await tx.user.create({
        data: {
          name: email.split('@')[0], // Use email prefix as name
          email,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          cabinetId: cabinet.id,
        },
        select: { id: true, name: true, email: true, role: true, cabinetId: true },
      })

      return { cabinet, admin }
    })

    return NextResponse.json(
      {
        message: 'Compte créé avec succès - Essai gratuit de 7 jours activé',
        cabinet: { 
          id: result.cabinet.id, 
          nom: result.cabinet.nom,
          trialEndDate: result.cabinet.trialEndDate,
          maxPatients: result.cabinet.maxPatients
        },
        admin: result.admin,
        trial: {
          days: trialDays,
          endDate: result.cabinet.trialEndDate,
          maxPatients: maxPatients
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur inscription publique:', error)
    // Handle Prisma unique constraint
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

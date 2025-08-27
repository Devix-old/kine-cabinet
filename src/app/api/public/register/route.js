import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SubscriptionService } from '@/lib/subscription-service'

// POST /api/public/register - Self-serve registration with trial
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      cabinetType = 'KINESITHERAPIE', // Default to kinesiology
      trialDays = 7,
      maxPatients = 3 // Fixed: should be 3 for trial, not 50
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

    // Create a temporary cabinet name; real name will be set during onboarding
    const generateTempName = () => `Cabinet Temp ${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    let finalCabinetName = generateTempName()
    while (await prisma.cabinet.findUnique({ where: { nom: finalCabinetName } })) {
      finalCabinetName = generateTempName()
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Get trial plan
    const trialPlan = await prisma.plan.findFirst({
      where: { name: 'trial' }
    })

    if (!trialPlan) {
      throw new Error('Trial plan not found')
    }

    // Create cabinet and admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const cabinet = await tx.cabinet.create({
        data: {
          nom: finalCabinetName,
          type: cabinetType, // Set cabinet type
          specialites: [], // Empty array for now
          adresse: null,
          telephone: null,
          email: email,
          siret: null,
          isActive: true,
          onboardingCompleted: false,
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

      // Create trial subscription using the service
      const subscription = await SubscriptionService.registerCabinetWithTrial(cabinet.id, trialPlan.id, tx)

      return { cabinet, admin, subscription }
    })

    return NextResponse.json(
      {
        message: 'Compte créé avec succès - Essai gratuit de 7 jours activé',
        cabinet: { 
          id: result.cabinet.id, 
          nom: result.cabinet.nom,
          type: result.cabinet.type,
        },
        admin: result.admin,
        subscription: {
          status: result.subscription.status,
          trialEnd: result.subscription.trialEnd,
          maxPatients: result.subscription.plan.maxPatients
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

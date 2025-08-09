import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/public/register - Self-serve registration: create cabinet and admin
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      clinicName,
      phone,
      address,
      siret
    } = body || {}

    // Basic validation
    if (!firstName || !lastName || !email || !password || !clinicName) {
      return NextResponse.json(
        { error: 'firstName, lastName, email, password et clinicName sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Check duplicates
    const [existingCabinet, existingUser] = await Promise.all([
      prisma.cabinet.findUnique({ where: { nom: clinicName } }),
      prisma.user.findFirst({ where: { email } })
    ])

    if (existingCabinet) {
      return NextResponse.json(
        { error: 'Un cabinet avec ce nom existe déjà' },
        { status: 409 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    const fullName = `${firstName} ${lastName}`.trim()

    // Create cabinet and admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const cabinet = await tx.cabinet.create({
        data: {
          nom: clinicName,
          adresse: address || null,
          telephone: phone || null,
          email: email,
          siret: siret || null,
          isActive: true,
        },
      })

      const hashedPassword = await bcrypt.hash(password, 10)

      const admin = await tx.user.create({
        data: {
          name: fullName,
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
        message: 'Compte créé avec succès',
        cabinet: { id: result.cabinet.id, nom: result.cabinet.nom },
        admin: result.admin,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur inscription publique:', error)
    // Handle Prisma unique constraint
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Conflit de duplication (email ou nom de cabinet déjà utilisé)' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

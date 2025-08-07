import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// POST /api/settings/password - Changer le mot de passe
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword, userId } = body

    // Déterminer l'utilisateur cible
    const targetUserId = userId || session.user.id

    // Seuls les admins peuvent changer le mot de passe d'autres utilisateurs
    if (targetUserId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Validation des données
    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Nouveau mot de passe et confirmation requis' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Les mots de passe ne correspondent pas' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, password: true, name: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier l'ancien mot de passe si c'est l'utilisateur lui-même
    if (targetUserId === session.user.id) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Mot de passe actuel requis' },
          { status: 400 }
        )
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        )
      }
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit être différent de l\'ancien' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: targetUserId },
      data: { password: hashedNewPassword }
    })

    // Log de sécurité (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Mot de passe changé pour l'utilisateur ${user.email} par ${session.user.email}`)
    }

    return NextResponse.json({
      message: 'Mot de passe mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    return NextResponse.json(
      { error: 'Erreur lors du changement de mot de passe' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/password - Générer un mot de passe temporaire (admin uniquement)
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
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Générer un mot de passe temporaire
    const tempPassword = generateTemporaryPassword()
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedTempPassword }
    })

    // Log de sécurité (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Mot de passe temporaire généré pour ${user.email} par ${session.user.email}`)
    }

    return NextResponse.json({
      message: 'Mot de passe temporaire généré avec succès',
      temporaryPassword: tempPassword,
      userEmail: user.email
    })

  } catch (error) {
    console.error('Erreur lors de la génération du mot de passe temporaire:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du mot de passe temporaire' },
      { status: 500 }
    )
  }
}

// POST /api/settings/password/validate - Valider la force d'un mot de passe
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Mot de passe requis pour validation' },
        { status: 400 }
      )
    }

    const validation = validatePasswordStrength(password)

    return NextResponse.json({
      isValid: validation.isValid,
      score: validation.score,
      feedback: validation.feedback,
      requirements: validation.requirements
    })

  } catch (error) {
    console.error('Erreur lors de la validation du mot de passe:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation' },
      { status: 500 }
    )
  }
}

// Fonction pour générer un mot de passe temporaire
function generateTemporaryPassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  let password = ''
  
  // Au moins un de chaque type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Compléter jusqu'à 12 caractères
  const allChars = uppercase + lowercase + numbers + symbols
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Fonction pour valider la force d'un mot de passe
function validatePasswordStrength(password) {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSymbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommonPatterns: !/(123|abc|password|admin|user)/i.test(password)
  }

  const metRequirements = Object.values(requirements).filter(Boolean).length
  const score = Math.min(100, (metRequirements / Object.keys(requirements).length) * 100)

  let feedback = []
  
  if (!requirements.minLength) feedback.push('Au moins 8 caractères')
  if (!requirements.hasUppercase) feedback.push('Au moins une majuscule')
  if (!requirements.hasLowercase) feedback.push('Au moins une minuscule')
  if (!requirements.hasNumbers) feedback.push('Au moins un chiffre')
  if (!requirements.hasSymbols) feedback.push('Au moins un caractère spécial')
  if (!requirements.noCommonPatterns) feedback.push('Éviter les mots courants')

  return {
    isValid: metRequirements >= 4, // Au moins 4 critères sur 6
    score: Math.round(score),
    feedback,
    requirements
  }
} 
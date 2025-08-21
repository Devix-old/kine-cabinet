import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Pour le multi-tenant, on cherche l'utilisateur par email
          // Le super admin n'a pas de cabinetId, les autres en ont un
          const user = await prisma.user.findFirst({
            where: { 
              email: credentials.email,
              isActive: true
            },
            include: {
              cabinet: {
                select: {
                  id: true,
                  nom: true,
                  type: true,
                  onboardingCompleted: true,
                  isActive: true
                }
              }
            }
          })

          if (!user) {
            console.log('❌ Utilisateur non trouvé:', credentials.email)
            return null
          }

          // Vérifier si le cabinet est actif (sauf pour le super admin)
          if (user.cabinetId && user.cabinet && !user.cabinet.isActive) {
            console.log('❌ Cabinet inactif pour:', credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log('❌ Mot de passe incorrect pour:', credentials.email)
            return null
          }

          // Authentication successful

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            cabinetId: user.cabinetId,
            cabinetName: user.cabinet?.nom || null,
            cabinetType: user.cabinet?.type || null,
            cabinetOnboardingCompleted: user.cabinet?.onboardingCompleted || false
          }
        } catch (error) {
          console.error('❌ Erreur lors de l\'authentification:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 heure seulement
    updateAge: 0, // Mettre à jour à chaque requête
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.name = user.name
        token.cabinetId = user.cabinetId
        token.cabinetName = user.cabinetName
        token.cabinetType = user.cabinetType
        token.cabinetOnboardingCompleted = user.cabinetOnboardingCompleted
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
        session.user.name = token.name
        session.user.cabinetId = token.cabinetId
        session.user.cabinetName = token.cabinetName
        session.user.cabinetType = token.cabinetType
        session.user.cabinetOnboardingCompleted = token.cabinetOnboardingCompleted
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Debug disabled for clean terminal
  debug: false
} 
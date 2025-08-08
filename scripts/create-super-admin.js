// Script pour créer un super administrateur initial
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    console.log('🔧 Création du super administrateur...')
    
    // Vérifier si un super admin existe déjà
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (existingSuperAdmin) {
      console.log('⚠️ Un super administrateur existe déjà:', existingSuperAdmin.email)
      return
    }

    // Créer le super admin
    const hashedPassword = await bcrypt.hash('superadmin123', 10)
    
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Super Administrateur',
        email: 'superadmin@kine-cabinet.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        // Pas de cabinetId pour le super admin (il gère tous les cabinets)
        cabinetId: null
      }
    })

    console.log('✅ Super administrateur créé avec succès!')
    console.log('📧 Email:', superAdmin.email)
    console.log('🔑 Mot de passe: superadmin123')
    console.log('⚠️ Changez ce mot de passe après la première connexion!')

  } catch (error) {
    console.error('❌ Erreur lors de la création du super admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin() 
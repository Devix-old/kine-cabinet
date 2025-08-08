// Script pour vérifier le super administrateur
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSuperAdmin() {
  try {
    console.log('🔍 Vérification du super administrateur...')
    
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (superAdmin) {
      console.log('✅ Super administrateur trouvé:')
      console.log('📧 Email:', superAdmin.email)
      console.log('👤 Nom:', superAdmin.name)
      console.log('🔑 Rôle:', superAdmin.role)
      console.log('🏢 Cabinet ID:', superAdmin.cabinetId)
      console.log('✅ Actif:', superAdmin.isActive)
    } else {
      console.log('❌ Aucun super administrateur trouvé')
    }

    // Vérifier tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        cabinetId: true
      }
    })

    console.log('\n📊 Tous les utilisateurs:')
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Cabinet: ${user.cabinetId || 'Aucun'}`)
    })

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSuperAdmin() 
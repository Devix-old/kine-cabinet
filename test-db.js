const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function testDatabase() {
  try {
    console.log('🔍 Test de connexion à la base de données...')
    
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion réussie')
    
    // Test de création d'un test
    const test = await prisma.test.create({
      data: {
        nom: 'Test de Connexion',
        description: 'Test automatique de la connexion Prisma',
        statut: 'ACTIF',
        valeur: 100
      }
    })
    console.log('✅ Test créé avec succès:', test)
    
    // Test de récupération
    const tests = await prisma.test.findMany()
    console.log('✅ Tests récupérés:', tests.length, 'tests')
    
    // Test de suppression
    await prisma.test.delete({
      where: { id: test.id }
    })
    console.log('✅ Test supprimé avec succès')
    
    console.log('🎉 Tous les tests sont passés avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase() 
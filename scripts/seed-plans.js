const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const plans = [
  {
    name: 'trial',
    displayName: 'Essai gratuit',
    description: 'Essai gratuit de 7 jours',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    maxPatients: 3,
    features: ['Gestion des rendez-vous', 'Dossiers médicaux basiques'],
    isActive: true,
    isTrial: true
  },
  {
    name: 'starter',
    displayName: 'Starter',
    description: 'Plan de base pour petits cabinets',
    price: 29,
    currency: 'EUR',
    interval: 'month',
    maxPatients: 80,
    features: [
      'Gestion des rendez-vous',
      'Dossiers médicaux basiques',
      'Support email'
    ],
    isActive: true,
    isTrial: false
  },
  {
    name: 'professional',
    displayName: 'Professional',
    description: 'Plan professionnel pour cabinets établis',
    price: 59,
    currency: 'EUR',
    interval: 'month',
    maxPatients: 200,
    features: [
      'Gestion des rendez-vous avancée',
      'Dossiers médicaux complets',
      'Facturation automatisée',
      'Rapports et analyses',
      'Support prioritaire'
    ],
    isActive: true,
    isTrial: false
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'Plan entreprise pour grandes structures',
    price: 99,
    currency: 'EUR',
    interval: 'month',
    maxPatients: -1, // Unlimited
    features: [
      'Tout du plan Professional',
      'Support multi-cabinets',
      'Gestion d\'équipe',
      'Support dédié 24/7',
      'Intégrations avancées'
    ],
    isActive: true,
    isTrial: false
  }
]

async function seedPlans() {
  try {
    console.log('🌱 Seeding plans...')

    for (const plan of plans) {
      const existingPlan = await prisma.plan.findUnique({
        where: { name: plan.name }
      })

      if (existingPlan) {
        console.log(`📝 Updating plan: ${plan.displayName}`)
        await prisma.plan.update({
          where: { name: plan.name },
          data: plan
        })
      } else {
        console.log(`➕ Creating plan: ${plan.displayName}`)
        await prisma.plan.create({
          data: plan
        })
      }
    }

    console.log('✅ Plans seeded successfully!')
    
    // Display all plans
    const allPlans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    })
    
    console.log('\n📋 Current plans:')
    allPlans.forEach(plan => {
      console.log(`- ${plan.displayName}: ${plan.price}${plan.currency}/${plan.interval} (${plan.maxPatients === -1 ? 'Unlimited' : plan.maxPatients} patients)`)
    })

  } catch (error) {
    console.error('❌ Error seeding plans:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPlans()

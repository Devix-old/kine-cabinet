const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testNewSubscriptionUI() {
  try {
    console.log('🧪 Testing new subscription UI logic...')

    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany({
      include: {
        plan: true,
        cabinet: true
      }
    })

    console.log(`📋 Found ${subscriptions.length} subscriptions`)

    for (const subscription of subscriptions) {
      console.log(`\n🔍 Testing subscription: ${subscription.id}`)
      console.log(`   Cabinet: ${subscription.cabinet?.nom}`)
      console.log(`   Plan: ${subscription.plan?.displayName}`)
      console.log(`   Status: ${subscription.status}`)

      const now = new Date()
      
      // Simulate the new logic
      const hasPaidPlanSelected = subscription.currentPeriodStart && subscription.currentPeriodEnd && 
                                  subscription.plan && !subscription.plan.isTrial

      // Calculate trial information
      let trialDaysLeft = 0
      let isInTrialPeriod = false
      let trialEndDate = null

      if (subscription.trialStart && subscription.trialEnd) {
        if (subscription.trialEnd > now) {
          trialDaysLeft = Math.ceil((subscription.trialEnd - now) / (1000 * 60 * 60 * 24))
          isInTrialPeriod = true
          trialEndDate = subscription.trialEnd
        }
      }

      // Calculate paid period information
      let paidPeriodStartDate = null
      let paidPeriodEndDate = null
      let paidDaysLeft = 0
      let isInPaidPeriod = false

      if (hasPaidPlanSelected) {
        paidPeriodStartDate = subscription.currentPeriodStart
        paidPeriodEndDate = subscription.currentPeriodEnd

        if (paidPeriodStartDate <= now && paidPeriodEndDate > now) {
          isInPaidPeriod = true
          paidDaysLeft = Math.ceil((paidPeriodEndDate - now) / (1000 * 60 * 60 * 24))
        } else if (paidPeriodStartDate > now) {
          paidDaysLeft = Math.ceil((paidPeriodEndDate - now) / (1000 * 60 * 60 * 24))
        }
      }

      // Determine display status
      let displayStatus = subscription.status
      let statusMessage = ''

      if (isInTrialPeriod && hasPaidPlanSelected) {
        displayStatus = 'TRIALING_WITH_PAID_PLAN'
        statusMessage = 'Votre abonnement est actif (en période d\'essai)'
      } else if (isInTrialPeriod) {
        displayStatus = 'TRIALING'
        statusMessage = 'Vous êtes actuellement en essai gratuit'
      } else if (isInPaidPeriod) {
        displayStatus = 'ACTIVE'
        statusMessage = 'Votre abonnement est actif'
      }

      console.log('   📊 Calculated UI state:')
      console.log(`      Has paid plan selected: ${hasPaidPlanSelected}`)
      console.log(`      Is in trial period: ${isInTrialPeriod}`)
      console.log(`      Is in paid period: ${isInPaidPeriod}`)
      console.log(`      Trial days left: ${trialDaysLeft}`)
      console.log(`      Paid days left: ${paidDaysLeft}`)
      console.log(`      Display status: ${displayStatus}`)
      console.log(`      Status message: ${statusMessage}`)

      if (trialEndDate) {
        console.log(`      Trial end: ${trialEndDate.toISOString()}`)
      }
      if (paidPeriodStartDate) {
        console.log(`      Paid period start: ${paidPeriodStartDate.toISOString()}`)
      }
      if (paidPeriodEndDate) {
        console.log(`      Paid period end: ${paidPeriodEndDate.toISOString()}`)
      }

      // Show what the UI would display
      console.log('   🖥️  UI would display:')
      console.log(`      Plan: ${subscription.plan?.displayName}`)
      console.log(`      Max patients: ${subscription.plan?.maxPatients === -1 ? 'Unlimited' : subscription.plan?.maxPatients}`)
      console.log(`      Current date: ${now.toLocaleDateString('fr-FR')}`)
      
      if (isInTrialPeriod) {
        console.log(`      Trial days remaining: ${trialDaysLeft} jours`)
        if (trialEndDate) {
          console.log(`      Trial end: ${trialEndDate.toLocaleDateString('fr-FR')}`)
        }
      }

      if (hasPaidPlanSelected) {
        if (paidPeriodStartDate) {
          console.log(`      Paid period start: ${paidPeriodStartDate.toLocaleDateString('fr-FR')}`)
        }
        if (paidPeriodEndDate) {
          console.log(`      Paid period end: ${paidPeriodEndDate.toLocaleDateString('fr-FR')}`)
        }
        if (isInPaidPeriod) {
          console.log(`      Paid days remaining: ${paidDaysLeft} jours`)
        }
      }
    }

    console.log('\n🎉 New subscription UI test completed!')

  } catch (error) {
    console.error('❌ Error testing new subscription UI:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNewSubscriptionUI()

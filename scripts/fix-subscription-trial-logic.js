const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSubscriptionTrialLogic() {
  try {
    console.log('🔧 Fixing subscription trial logic...')

    // Get all subscriptions that need to be checked
    const subscriptions = await prisma.subscription.findMany({
      where: {
        OR: [
          { status: 'ACTIVE' },
          { status: 'TRIALING' }
        ]
      },
      include: {
        plan: true,
        cabinet: true
      }
    })

    console.log(`📋 Found ${subscriptions.length} subscriptions to check`)

    for (const subscription of subscriptions) {
      console.log(`\n🔍 Checking subscription ${subscription.id} (${subscription.cabinet?.nom})`)
      console.log(`   Plan: ${subscription.plan?.displayName}`)
      console.log(`   Current status: ${subscription.status}`)

      const now = new Date()
      let needsUpdate = false
      let updateData = {}

      // Check if this is a trial with leftover days and a paid plan selected
      if (subscription.trialStart && subscription.trialEnd && 
          subscription.currentPeriodStart && subscription.currentPeriodEnd &&
          subscription.plan && !subscription.plan.isTrial) {
        
        const trialDaysLeft = subscription.trialEnd > now
          ? Math.ceil((subscription.trialEnd - now) / (1000 * 60 * 60 * 24))
          : 0

        console.log(`   Trial days left: ${trialDaysLeft}`)
        console.log(`   Trial end: ${subscription.trialEnd.toISOString()}`)
        console.log(`   Paid period start: ${subscription.currentPeriodStart.toISOString()}`)
        console.log(`   Paid period end: ${subscription.currentPeriodEnd.toISOString()}`)

        // If there are leftover trial days, the paid period should start after trial ends
        if (trialDaysLeft > 0 && subscription.currentPeriodStart <= now) {
          console.log(`   ⚠️  Paid period starts too early, should start after trial ends`)
          
          // Recalculate paid period dates
          const correctPaidPeriodStart = new Date(subscription.trialEnd.getTime())
          const planDurationDays = subscription.plan.durationDays || 30
          const correctPaidPeriodEnd = new Date(correctPaidPeriodStart.getTime() + (planDurationDays * 24 * 60 * 60 * 1000))

          updateData = {
            currentPeriodStart: correctPaidPeriodStart,
            currentPeriodEnd: correctPaidPeriodEnd,
            status: 'TRIALING', // Keep as TRIALING until trial ends
            updatedAt: new Date()
          }

          needsUpdate = true

          console.log(`   ✅ Will update to:`)
          console.log(`      Paid period start: ${correctPaidPeriodStart.toISOString()}`)
          console.log(`      Paid period end: ${correctPaidPeriodEnd.toISOString()}`)
          console.log(`      Status: TRIALING`)
        }
      }

      // Check if trial has ended but subscription is still TRIALING
      if (subscription.status === 'TRIALING' && subscription.trialEnd && subscription.trialEnd <= now) {
        if (subscription.currentPeriodStart && subscription.currentPeriodEnd && subscription.currentPeriodEnd > now) {
          console.log(`   ⚠️  Trial ended, switching to ACTIVE`)
          updateData = {
            status: 'ACTIVE',
            updatedAt: new Date()
          }
          needsUpdate = true
        } else {
          console.log(`   ⚠️  Trial ended, switching to EXPIRED`)
          updateData = {
            status: 'EXPIRED',
            updatedAt: new Date()
          }
          needsUpdate = true
        }
      }

      if (needsUpdate) {
        console.log(`   🔄 Updating subscription...`)
        
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: updateData
        })

        console.log(`   ✅ Subscription updated successfully`)
      } else {
        console.log(`   ✅ Subscription is correct`)
      }
    }

    console.log('\n🎉 Subscription trial logic fix completed!')

  } catch (error) {
    console.error('❌ Error fixing subscription trial logic:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSubscriptionTrialLogic()

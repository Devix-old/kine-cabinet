import { prisma } from './prisma'

export class SubscriptionService {
  /**
   * Register a new cabinet with trial subscription
   * @param {string} cabinetId - The cabinet ID
   * @param {string} planId - The trial plan ID
   * @param {Object} tx - Optional transaction instance
   * @returns {Promise<Object>} The created subscription
   */
  static async registerCabinetWithTrial(cabinetId, planId, tx = null) {
    const trialStart = new Date()
    const trialEnd = new Date(trialStart.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days

    const client = tx || prisma

    return await client.subscription.create({
      data: {
        planId,
        status: 'TRIALING',
        trialStart,
        trialEnd,
        // currentPeriodStart and currentPeriodEnd left empty for trials
        cabinetId
      },
      include: {
        plan: true,
        cabinet: true
      }
    })
  }

  /**
   * Upgrade subscription to a paid plan
   * @param {string} cabinetId - The cabinet ID
   * @param {string} planId - The new plan ID
   * @returns {Promise<Object>} The updated subscription
   */
  static async upgradeSubscription(cabinetId, planId) {
    // Get current subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: { cabinetId },
      include: { plan: true }
    })

    if (!currentSubscription) {
      throw new Error('No subscription found for this cabinet')
    }

    // Get the new plan
    const newPlan = await prisma.plan.findUnique({
      where: { id: planId }
    })

    if (!newPlan) {
      throw new Error('Plan not found')
    }

    // Calculate leftover trial days
    const now = new Date()
    const leftoverDays = currentSubscription.trialEnd && currentSubscription.trialEnd > now
      ? Math.ceil((currentSubscription.trialEnd - now) / (1000 * 60 * 60 * 24))
      : 0

    // If there are leftover trial days, the paid period starts after trial ends
    // If no leftover days, paid period starts immediately
    const paidPeriodStart = leftoverDays > 0 
      ? new Date(currentSubscription.trialEnd.getTime())
      : new Date()

    // Calculate paid period end date (plan duration from paid period start)
    const planDurationDays = newPlan.durationDays || 30
    const paidPeriodEnd = new Date(paidPeriodStart.getTime() + (planDurationDays * 24 * 60 * 60 * 1000))

    console.log('🔄 Upgrading subscription:', {
      cabinetId,
      fromPlan: currentSubscription.plan?.displayName,
      toPlan: newPlan.displayName,
      leftoverDays,
      planDurationDays,
      trialEnd: currentSubscription.trialEnd?.toISOString(),
      paidPeriodStart: paidPeriodStart.toISOString(),
      paidPeriodEnd: paidPeriodEnd.toISOString()
    })

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        planId,
        status: leftoverDays > 0 ? 'TRIALING' : 'ACTIVE', // Keep TRIALING if there are leftover days
        currentPeriodStart: paidPeriodStart,
        currentPeriodEnd: paidPeriodEnd,
        updatedAt: new Date()
      },
      include: {
        plan: true,
        cabinet: true
      }
    })

    return {
      subscription: updatedSubscription,
      leftoverDays,
      paidPeriodStart,
      paidPeriodEnd,
      planDurationDays
    }
  }

  /**
   * Check and update subscription status
   * @param {string} cabinetId - The cabinet ID
   * @returns {Promise<Object>} The subscription status
   */
  static async checkSubscriptionStatus(cabinetId) {
    const subscription = await prisma.subscription.findFirst({
      where: { cabinetId },
      include: { plan: true }
    })

    if (!subscription) {
      return {
        hasSubscription: false,
        status: null,
        daysLeft: 0,
        isActive: false,
        isExpired: false,
        isTrial: false
      }
    }

    console.log('🔍 Checking subscription status:', {
      id: subscription.id,
      status: subscription.status,
      trialStart: subscription.trialStart?.toISOString(),
      trialEnd: subscription.trialEnd?.toISOString(),
      currentPeriodStart: subscription.currentPeriodStart?.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString()
    })

    // Check if subscription needs status update
    let status = subscription.status
    let daysLeft = 0
    let isExpired = false
    const now = new Date()

    if (subscription.status === 'TRIALING') {
      if (subscription.trialEnd) {
        if (subscription.trialEnd <= now) {
          // Trial ended, check if there's a paid period waiting
          if (subscription.currentPeriodStart && subscription.currentPeriodStart > now) {
            // Paid period is scheduled to start, switch to ACTIVE
            status = 'ACTIVE'
            daysLeft = Math.ceil((subscription.currentPeriodEnd - now) / (1000 * 60 * 60 * 24))
          } else if (subscription.currentPeriodEnd && subscription.currentPeriodEnd > now) {
            // Paid period is already active
            status = 'ACTIVE'
            daysLeft = Math.ceil((subscription.currentPeriodEnd - now) / (1000 * 60 * 60 * 24))
          } else {
            status = 'CANCELED'
            isExpired = true
          }
        } else {
          daysLeft = Math.ceil((subscription.trialEnd - now) / (1000 * 60 * 60 * 24))
        }
      } else {
        // If no trial end date, assume expired
        status = 'CANCELED'
        isExpired = true
      }
    } else if (subscription.status === 'ACTIVE') {
      if (subscription.currentPeriodEnd) {
        if (subscription.currentPeriodEnd <= now) {
          status = 'CANCELED'
          isExpired = true
        } else {
          daysLeft = Math.ceil((subscription.currentPeriodEnd - now) / (1000 * 60 * 60 * 24))
        }
      } else {
        // If no current period end date but status is ACTIVE, calculate it
        if (subscription.currentPeriodStart) {
          // Calculate end date based on plan duration
          const planDurationDays = subscription.plan?.durationDays || 30
          const calculatedEndDate = new Date(subscription.currentPeriodStart.getTime() + (planDurationDays * 24 * 60 * 60 * 1000))
          if (calculatedEndDate <= now) {
            status = 'CANCELED'
            isExpired = true
          } else {
            daysLeft = Math.ceil((calculatedEndDate - now) / (1000 * 60 * 60 * 24))
          }
        } else {
          // If no period dates at all, assume expired
          status = 'CANCELED'
          isExpired = true
        }
      }
    }

    console.log('📊 Status calculation:', {
      originalStatus: subscription.status,
      calculatedStatus: status,
      daysLeft,
      isExpired
    })

    // Update status if it changed
    if (status !== subscription.status) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status }
      })
      console.log('🔄 Updated subscription status from', subscription.status, 'to', status)
    }

    return {
      hasSubscription: true,
      subscription: {
        ...subscription,
        status
      },
      status,
      daysLeft,
      isActive: status === 'ACTIVE' || status === 'TRIALING',
      isExpired,
      isTrial: status === 'TRIALING',
      maxPatients: subscription.plan?.maxPatients || 3
    }
  }

  /**
   * Cancel subscription
   * @param {string} cabinetId - The cabinet ID
   * @returns {Promise<Object>} The updated subscription
   */
  static async cancelSubscription(cabinetId) {
    const subscription = await prisma.subscription.findFirst({
      where: { cabinetId }
    })

    if (!subscription) {
      throw new Error('No subscription found for this cabinet')
    }

    return await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        plan: true,
        cabinet: true
      }
    })
  }

  /**
   * Get subscription info for display
   * @param {string} cabinetId - The cabinet ID
   * @returns {Promise<Object>} Formatted subscription info
   */
  static async getSubscriptionInfo(cabinetId) {
    const statusInfo = await this.checkSubscriptionStatus(cabinetId)
    
    if (!statusInfo.hasSubscription) {
      return {
        hasSubscription: false,
        message: 'No subscription found'
      }
    }

    const { subscription, daysLeft, isExpired, isTrial } = statusInfo

    // Calculate detailed subscription information
    const detailedInfo = await this.calculateDetailedSubscriptionInfo(subscription, statusInfo)

    return {
      hasSubscription: true,
      planName: subscription.plan?.displayName || 'Unknown',
      status: subscription.status,
      daysLeft,
      daysLeftFormatted: this.formatDaysLeft(daysLeft),
      isExpired,
      isTrial,
      isActive: statusInfo.isActive,
      maxPatients: subscription.plan?.maxPatients || 3,
      startDate: isTrial ? subscription.trialStart : subscription.currentPeriodStart,
      endDate: isTrial ? subscription.trialEnd : subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      // Detailed information for UI
      ...detailedInfo
    }
  }

  /**
   * Calculate detailed subscription information for UI display
   * @param {Object} subscription - The subscription object
   * @param {Object} statusInfo - The status information
   * @returns {Promise<Object>} Detailed subscription info
   */
  static async calculateDetailedSubscriptionInfo(subscription, statusInfo) {
    const now = new Date()
    
    // Check if this is a trial with a paid plan selected
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
        // Currently in paid period
        isInPaidPeriod = true
        paidDaysLeft = Math.ceil((paidPeriodEndDate - now) / (1000 * 60 * 60 * 24))
      } else if (paidPeriodStartDate > now) {
        // Paid period is scheduled to start
        paidDaysLeft = Math.ceil((paidPeriodEndDate - now) / (1000 * 60 * 60 * 24))
      }
    }

    // Determine current status for display
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
    } else if (statusInfo.isExpired) {
      displayStatus = 'CANCELED'
      statusMessage = 'Votre abonnement a expiré'
    }

    console.log('📊 Detailed subscription info:', {
      subscriptionId: subscription.id,
      hasPaidPlanSelected,
      isInTrialPeriod,
      isInPaidPeriod,
      trialDaysLeft,
      paidDaysLeft,
      displayStatus,
      statusMessage
    })

    return {
      hasPaidPlanSelected,
      isInTrialPeriod,
      isInPaidPeriod,
      trialDaysLeft,
      trialDaysLeftFormatted: this.formatDaysLeft(trialDaysLeft),
      paidDaysLeft,
      paidDaysLeftFormatted: this.formatDaysLeft(paidDaysLeft),
      trialEndDate,
      paidPeriodStartDate,
      paidPeriodEndDate,
      displayStatus,
      statusMessage,
      currentDate: now
    }
  }

  /**
   * Format days left for display
   * @param {number} daysLeft - Number of days left
   * @returns {string} Formatted string
   */
  static formatDaysLeft(daysLeft) {
    if (daysLeft === 0) {
      return 'Expiré'
    } else if (daysLeft === 1) {
      return '1 jour restant'
    } else {
      return `${daysLeft} jours restants`
    }
  }

  /**
   * Update subscription from Stripe webhook
   * @param {Object} stripeSubscription - Stripe subscription object
   * @param {string} planId - The plan ID
   * @returns {Promise<Object>} The updated subscription
   */
  static async updateFromStripe(stripeSubscription, planId) {
    const { 
      id: stripeSubscriptionId, 
      customer: stripeCustomerId, 
      status, 
      current_period_start, 
      current_period_end, 
      trial_start, 
      trial_end 
    } = stripeSubscription

    console.log('🔄 Updating subscription from Stripe:', {
      stripeSubscriptionId,
      status,
      current_period_start,
      current_period_end,
      trial_start,
      trial_end
    })

    // Find existing subscription by Stripe ID
    let subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId }
    })

    if (!subscription) {
      // Find by cabinet ID if Stripe ID not found
      const cabinet = await prisma.user.findFirst({
        where: { stripeCustomerId },
        select: { cabinetId: true }
      })

      if (cabinet) {
        subscription = await prisma.subscription.findFirst({
          where: { cabinetId: cabinet.cabinetId }
        })
      }
    }

    if (!subscription) {
      throw new Error('No subscription found to update')
    }

    // Determine status and dates
    let dbStatus = status.toUpperCase()
    let trialStart = subscription.trialStart // Keep existing trial dates
    let trialEnd = subscription.trialEnd // Keep existing trial dates
    let currentPeriodStart = subscription.currentPeriodStart // Keep existing period dates
    let currentPeriodEnd = subscription.currentPeriodEnd // Keep existing period dates

    // Update trial dates if provided and subscription is in trial
    if (dbStatus === 'TRIALING') {
      if (trial_start) trialStart = new Date(trial_start * 1000)
      if (trial_end) trialEnd = new Date(trial_end * 1000)
    }

    // Update current period dates if provided (for both TRIALING and ACTIVE)
    if (current_period_start) {
      currentPeriodStart = new Date(current_period_start * 1000)
    }
    if (current_period_end) {
      currentPeriodEnd = new Date(current_period_end * 1000)
    }

    // If subscription is ACTIVE but has no current period dates, calculate them
    if (dbStatus === 'ACTIVE' && !currentPeriodStart && !currentPeriodEnd) {
      const now = new Date()
      currentPeriodStart = now
      // Calculate end date based on plan duration (30 days for monthly)
      currentPeriodEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    }

    console.log('📅 Calculated dates:', {
      dbStatus,
      trialStart: trialStart?.toISOString(),
      trialEnd: trialEnd?.toISOString(),
      currentPeriodStart: currentPeriodStart?.toISOString(),
      currentPeriodEnd: currentPeriodEnd?.toISOString()
    })

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        stripeSubscriptionId,
        stripeCustomerId,
        planId,
        status: dbStatus,
        trialStart,
        trialEnd,
        currentPeriodStart,
        currentPeriodEnd,
        updatedAt: new Date()
      },
      include: {
        plan: true,
        cabinet: true
      }
    })

    console.log('✅ Subscription updated successfully:', {
      id: updatedSubscription.id,
      status: updatedSubscription.status,
      currentPeriodStart: updatedSubscription.currentPeriodStart?.toISOString(),
      currentPeriodEnd: updatedSubscription.currentPeriodEnd?.toISOString()
    })

    return updatedSubscription
  }
}

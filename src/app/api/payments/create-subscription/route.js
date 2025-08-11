import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSubscription, createCustomer, SUBSCRIPTION_PLANS } from '@/lib/stripe'
import { withCabinetIsolation } from '@/middleware/cabinetIsolation'

export const POST = withCabinetIsolation(async (request, context) => {
  try {
    const { session, cabinetId } = context
    const body = await request.json()
    
    const { 
      planId, 
      paymentMethodId = null,
      country = 'MA',
      metadata = {}
    } = body

    // Validate plan
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan d\'abonnement invalide' },
        { status: 400 }
      )
    }

    // Get cabinet info
    const cabinet = await prisma.cabinet.findUnique({
      where: { id: cabinetId },
      select: { nom: true, email: true }
    })

    if (!cabinet) {
      return NextResponse.json(
        { error: 'Cabinet non trouvé' },
        { status: 404 }
      )
    }

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { 
        cabinetId,
        role: 'ADMIN'
      },
      select: { 
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true
      }
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Utilisateur admin non trouvé' },
        { status: 404 }
      )
    }

    // Create or get Stripe customer
    let stripeCustomerId = adminUser.stripeCustomerId
    
    if (!stripeCustomerId) {
      const stripeCustomer = await createCustomer(
        adminUser.email,
        adminUser.name,
        {
          cabinetId,
          cabinetName: cabinet.nom,
          userId: adminUser.id
        }
      )
      
      stripeCustomerId = stripeCustomer.id
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { stripeCustomerId }
      })
    }

    // Create subscription in Stripe
    const stripeSubscription = await createSubscription(
      stripeCustomerId,
      plan.stripePriceId,
      paymentMethodId
    )

    // Create subscription record in database
    const subscription = await prisma.subscription.create({
      data: {
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId,
        planId,
        status: stripeSubscription.status.toUpperCase(),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
        cabinetId,
        metadata: {
          ...metadata,
          country,
          planName: plan.name
        }
      }
    })

    // If there's a payment intent in the subscription, create payment record
    if (stripeSubscription.latest_invoice?.payment_intent) {
      const paymentIntent = stripeSubscription.latest_invoice.payment_intent
      
      await prisma.payment.create({
        data: {
          stripePaymentIntentId: paymentIntent.id,
          amount: plan.price,
          currency: plan.currency,
          status: paymentIntent.status.toUpperCase(),
          paymentMethod: 'CARD',
          description: `Abonnement ${plan.name}`,
          metadata: {
            subscriptionId: subscription.id,
            planId,
            country
          },
          cabinetId,
          subscriptionId: subscription.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        stripeId: stripeSubscription.id,
        status: subscription.status,
        planId: subscription.planId,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd
      },
      plan: {
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        features: plan.features
      },
      requiresAction: stripeSubscription.status === 'incomplete',
      clientSecret: stripeSubscription.latest_invoice?.payment_intent?.client_secret
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'abonnement' },
      { status: 500 }
    )
  }
})

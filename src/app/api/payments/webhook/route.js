import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { SubscriptionService } from '@/lib/subscription-service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || '2024-06-20',
  typescript: true,
})

const relevantEvents = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'setup_intent.succeeded',
  'setup_intent.canceled',
  'checkout.session.completed'
])

export async function POST(request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    // Webhook signature verified
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object)
          break
        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object)
          break
        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object)
          break
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object)
          break
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object)
          break
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object)
          break
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object)
          break
        case 'setup_intent.succeeded':
          await handleSetupIntentSucceeded(event.data.object)
          break
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object)
          break
        default:
          console.warn('Unhandled relevant event:', event.type)
      }
    } catch (error) {
      console.error('Error handling webhook event:', error)
      return NextResponse.json(
        { error: 'Webhook handler failed' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  const { metadata } = paymentIntent
  
  // Update payment record
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: 'SUCCEEDED',
      stripeChargeId: paymentIntent.latest_charge,
      updatedAt: new Date()
    }
  })

  // If this payment is for an invoice, update the invoice
  if (metadata.invoiceId) {
    await prisma.invoice.updateMany({
      where: { id: metadata.invoiceId },
      data: {
        statut: 'PAYEE',
        datePaiement: new Date(),
        modePaiement: paymentIntent.payment_method_types[0] || 'CARD',
        updatedAt: new Date()
      }
    })
  }

  // Payment succeeded
}

async function handlePaymentIntentFailed(paymentIntent) {
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: 'FAILED',
      updatedAt: new Date()
    }
  })

  // Payment failed
}

async function handleInvoicePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    // Update subscription status
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    })
  }

  // Invoice payment succeeded
}

async function handleInvoicePaymentFailed(invoice) {
  if (invoice.subscription) {
    // Update subscription status
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription },
      data: {
        status: 'PAST_DUE',
        updatedAt: new Date()
      }
    })
  }

  // Invoice payment failed
}

async function handleSubscriptionCreated(subscription) {
  try {
    console.log('🔄 Handling subscription created:', subscription.id)
    
    // Get plan ID from price nickname or metadata
    const planIdFromPrice = Array.isArray(subscription.items?.data) && subscription.items.data[0]?.price?.nickname
      ? subscription.items.data[0].price.nickname.toLowerCase()
      : (subscription.metadata?.planId || 'unknown')

    // Find the plan in our database
    const plan = await prisma.plan.findFirst({
      where: { name: planIdFromPrice }
    })

    if (!plan) {
      console.error('❌ Plan not found for:', planIdFromPrice)
      return
    }

    // Use the subscription service to update from Stripe
    await SubscriptionService.updateFromStripe(subscription, plan.id)
    
    console.log('✅ Subscription created successfully')
  } catch (error) {
    console.error('❌ Error handling subscription created:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('🔄 Handling subscription updated:', subscription.id)
    
    // Get plan ID from price nickname or metadata
    const planIdFromPrice = Array.isArray(subscription.items?.data) && subscription.items.data[0]?.price?.nickname
      ? subscription.items.data[0].price.nickname.toLowerCase()
      : (subscription.metadata?.planId || 'unknown')

    // Find the plan in our database
    const plan = await prisma.plan.findFirst({
      where: { name: planIdFromPrice }
    })

    if (!plan) {
      console.error('❌ Plan not found for:', planIdFromPrice)
      return
    }

    // Use the subscription service to update from Stripe
    await SubscriptionService.updateFromStripe(subscription, plan.id)
    
    console.log('✅ Subscription updated successfully')
  } catch (error) {
    console.error('❌ Error handling subscription updated:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription) {
  // Update subscription record
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Subscription deleted
}

async function handleSetupIntentSucceeded(setupIntent) {
  const { metadata } = setupIntent
  
  if (metadata.paymentMethodId) {
    // Update payment method as active
    await prisma.paymentMethod.updateMany({
      where: { stripePaymentMethodId: metadata.paymentMethodId },
      data: {
        isActive: true,
        updatedAt: new Date()
      }
    })
  }

  // Setup intent succeeded
}

async function handleCheckoutSessionCompleted(checkoutSession) {
  try {
    console.log('🔄 Handling checkout session completed:', checkoutSession.id)
    
    // If this is a subscription checkout, update subscription
    if (checkoutSession.mode === 'subscription' && checkoutSession.metadata?.cabinetId) {
      const subscriptionId = checkoutSession.subscription?.toString?.()
      if (subscriptionId) {
        // Fetch latest subscription from Stripe to get accurate periods
        const StripeModule = (await import('stripe')).default
        const client = new StripeModule(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia', typescript: true })
        const sub = await client.subscriptions.retrieve(subscriptionId)

        const planIdFromPrice = Array.isArray(sub.items?.data) && sub.items.data[0]?.price?.nickname
          ? sub.items.data[0].price.nickname.toLowerCase()
          : (checkoutSession.metadata?.planId || 'unknown')

        // Find the plan in our database
        const plan = await prisma.plan.findFirst({
          where: { name: planIdFromPrice }
        })

        if (plan) {
          // Use the subscription service to update from Stripe
          await SubscriptionService.updateFromStripe(sub, plan.id)
          console.log('✅ Subscription updated from checkout session')
        } else {
          console.error('❌ Plan not found for:', planIdFromPrice)
        }
      }
    }

    console.log('✅ Checkout session completed successfully')
  } catch (error) {
    console.error('❌ Error processing checkout session:', error)
    throw error
  }
}

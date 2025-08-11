import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
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
  console.log('🚀 WEBHOOK ENDPOINT CALLED!')
  
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  console.log('🔔 Webhook received:', { 
    bodyLength: body.length, 
    hasSignature: !!signature,
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method
  })

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log('✅ Webhook signature verified, event type:', event.type)
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  if (relevantEvents.has(event.type)) {
    console.log('🎯 Processing relevant event:', event.type)
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

  console.log('✅ Payment succeeded:', paymentIntent.id)
}

async function handlePaymentIntentFailed(paymentIntent) {
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: 'FAILED',
      updatedAt: new Date()
    }
  })

  console.log('❌ Payment failed:', paymentIntent.id)
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

  console.log('✅ Invoice payment succeeded:', invoice.id)
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

  console.log('❌ Invoice payment failed:', invoice.id)
}

async function handleSubscriptionCreated(subscription) {
  console.log('🔄 Processing subscription created:', subscription.id)
  console.log('📋 Subscription metadata:', subscription.metadata)

  try {
    // Update subscription record
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status.toUpperCase(),
        currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        updatedAt: new Date()
      }
    })

    // Update cabinet status - end trial and activate subscription
    if (subscription.metadata?.cabinetId) {
      await prisma.cabinet.updateMany({
        where: { id: subscription.metadata.cabinetId },
        data: {
          isTrialActive: false,
          trialEndDate: new Date(), // End trial immediately
          maxPatients: subscription.metadata.planId === 'starter' ? 100 : 
                      subscription.metadata.planId === 'professional' ? 1000 : 
                      10000, // Unlimited for enterprise
          updatedAt: new Date()
        }
      })

      console.log('✅ Cabinet updated - trial ended, subscription activated')
      console.log('📊 Plan:', subscription.metadata.planId)
      console.log('🏥 Cabinet ID:', subscription.metadata.cabinetId)
    } else {
      console.log('⚠️ No cabinetId in subscription metadata')
    }

    console.log('✅ Subscription created and cabinet updated:', subscription.id)
  } catch (error) {
    console.error('❌ Error updating subscription/cabinet:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscription) {
  // Update subscription record
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status.toUpperCase(),
      currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      updatedAt: new Date()
    }
  })

  console.log('✅ Subscription updated:', subscription.id)
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

  console.log('✅ Subscription deleted:', subscription.id)
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

  console.log('✅ Setup intent succeeded:', setupIntent.id)
}

async function handleCheckoutSessionCompleted(checkoutSession) {
  console.log('🔄 Processing checkout session completed:', checkoutSession.id)
  console.log('📋 Checkout metadata:', checkoutSession.metadata)

  try {
    // If this is a subscription checkout, update cabinet immediately
    if (checkoutSession.mode === 'subscription' && checkoutSession.metadata?.cabinetId) {
      await prisma.cabinet.updateMany({
        where: { id: checkoutSession.metadata.cabinetId },
        data: {
          isTrialActive: false,
          trialEndDate: new Date(), // End trial immediately
          maxPatients: checkoutSession.metadata.planId === 'starter' ? 100 : 
                      checkoutSession.metadata.planId === 'professional' ? 1000 : 
                      10000, // Unlimited for enterprise
          updatedAt: new Date()
        }
      })

      console.log('✅ Cabinet updated from checkout session')
      console.log('📊 Plan:', checkoutSession.metadata.planId)
      console.log('🏥 Cabinet ID:', checkoutSession.metadata.cabinetId)
    }

    console.log('✅ Checkout session completed:', checkoutSession.id)
  } catch (error) {
    console.error('❌ Error processing checkout session:', error)
    throw error
  }
}

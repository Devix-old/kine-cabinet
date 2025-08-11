import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// POST /api/payments/create-checkout-session
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.cabinetId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId, successUrl, cancelUrl } = body

    if (!planId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'planId, successUrl et cancelUrl sont requis' },
        { status: 400 }
      )
    }

    // Get cabinet info
    const cabinet = await prisma.cabinet.findUnique({
      where: { id: session.user.cabinetId },
      include: { users: true }
    })

    if (!cabinet) {
      return NextResponse.json(
        { error: 'Cabinet non trouvé' },
        { status: 404 }
      )
    }

    // Get plan details
    const plans = {
      starter: {
        priceId: process.env.STRIPE_STARTER_PRICE_ID,
        name: 'Starter'
      },
      professional: {
        priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
        name: 'Professional'
      },
      enterprise: {
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        name: 'Enterprise'
      }
    }

    // Debug: Log the plan details
    console.log('🔍 DEBUG - Plan details:', {
      planId,
      plan: plans[planId],
      envVars: {
        starter: process.env.STRIPE_STARTER_PRICE_ID,
        professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
        enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID
      }
    })

    // Check if we have Product IDs instead of Price IDs
    const hasProductIds = Object.values(plans).some(plan => 
      plan.priceId && plan.priceId.startsWith('prod_')
    )

    if (hasProductIds) {
      console.log('❌ ERROR: Product IDs detected instead of Price IDs!')
      console.log('🔧 FIX: You need to use Price IDs (price_...) not Product IDs (prod_...)')
      console.log('📝 Current IDs:', Object.fromEntries(
        Object.entries(plans).map(([key, plan]) => [key, plan.priceId])
      ))
    }

    const plan = plans[planId]
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId = cabinet.users.find(u => u.stripeCustomerId)?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: cabinet.email || session.user.email,
        name: cabinet.nom,
        metadata: {
          cabinetId: cabinet.id
        }
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Validate price ID format
    if (!plan.priceId || plan.priceId === 'price_...' || plan.priceId === undefined) {
      console.log('❌ ERROR: Invalid or missing price ID')
      return NextResponse.json(
        { error: 'Price ID invalide ou manquant' },
        { status: 400 }
      )
    }

    if (plan.priceId.startsWith('prod_')) {
      console.log('❌ ERROR: Product ID detected instead of Price ID')
      return NextResponse.json(
        { error: 'Product ID détecté au lieu de Price ID. Utilisez un Price ID (price_...)' },
        { status: 400 }
      )
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        cabinetId: cabinet.id,
        planId: planId,
        planName: plan.name
      },
      subscription_data: {
        metadata: {
          cabinetId: cabinet.id,
          planId: planId,
          planName: plan.name
        },
        // If cabinet is in trial, start subscription after trial ends
        ...(cabinet.isTrialActive && {
          trial_period_days: Math.ceil((new Date(cabinet.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))
        })
      }
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}

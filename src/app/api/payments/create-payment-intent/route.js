import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentIntent, getCurrencyForCountry } from '@/lib/stripe-client'
import { withCabinetIsolation } from '@/middleware/cabinetIsolation'

export const POST = withCabinetIsolation(async (request, context) => {
  try {
    const { session, cabinetId } = context
    const body = await request.json()
    
    const { 
      amount, 
      currency, 
      description, 
      metadata = {},
      paymentMethodType = 'card',
      invoiceId = null 
    } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      )
    }

    // Get cabinet info for customer creation
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

    // Get or create Stripe customer
    let customer = await prisma.user.findFirst({
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

    if (!customer) {
      return NextResponse.json(
        { error: 'Utilisateur admin non trouvé' },
        { status: 404 }
      )
    }

    // If no Stripe customer ID, create one
    if (!customer.stripeCustomerId) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.name,
        metadata: {
          cabinetId,
          cabinetName: cabinet.nom
        }
      })

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: customer.id },
        data: { stripeCustomerId: stripeCustomer.id }
      })

      customer.stripeCustomerId = stripeCustomer.id
    }

    // Determine currency based on country if not provided
    const finalCurrency = currency || getCurrencyForCountry('MA') // Default to Morocco

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      amount,
      finalCurrency,
      customer.stripeCustomerId,
      {
        ...metadata,
        cabinetId,
        userId: customer.id,
        paymentMethodType,
        invoiceId
      }
    )

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        amount,
        currency: finalCurrency,
        status: 'PENDING',
        paymentMethod: paymentMethodType.toUpperCase(),
        description,
        metadata: metadata,
        cabinetId,
        invoiceId
      }
    })

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      }
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
})

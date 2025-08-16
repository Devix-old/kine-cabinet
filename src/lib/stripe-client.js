import Stripe from 'stripe'

// Initialize Stripe with environment variables (SERVER-SIDE ONLY)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Import client-side configurations
import { SUBSCRIPTION_PLANS as CLIENT_PLANS, getCurrencyForCountry } from './stripe'

// Server-side subscription plans with Stripe price IDs
export const SUBSCRIPTION_PLANS = {
  starter: {
    ...CLIENT_PLANS.starter,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID
  },
  professional: {
    ...CLIENT_PLANS.professional,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID
  },
  enterprise: {
    ...CLIENT_PLANS.enterprise,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID
  }
}

// Re-export client-side functions for server use
export { getCurrencyForCountry } from './stripe-client'

// Stripe utility functions (SERVER-SIDE ONLY)
export const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    })
    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw new Error('Failed to create customer')
  }
}

export const createSubscription = async (customerId, priceId, paymentMethodId = null) => {
  try {
    const subscriptionData = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    }

    if (paymentMethodId) {
      subscriptionData.default_payment_method = paymentMethodId
    }

    const subscription = await stripe.subscriptions.create(subscriptionData)
    return subscription
  } catch (error) {
    console.error('Error creating Stripe subscription:', error)
    throw new Error('Failed to create subscription')
  }
}

export const createPaymentIntent = async (amount, currency, customerId, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })
    return paymentIntent
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error)
    throw new Error('Failed to create payment intent')
  }
}

export const createSetupIntent = async (customerId, metadata = {}) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata,
    })
    return setupIntent
  } catch (error) {
    console.error('Error creating Stripe setup intent:', error)
    throw new Error('Failed to create setup intent')
  }
}

export const attachPaymentMethod = async (paymentMethodId, customerId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })
    return paymentMethod
  } catch (error) {
    console.error('Error attaching payment method:', error)
    throw new Error('Failed to attach payment method')
  }
}

export const detachPaymentMethod = async (paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)
    return paymentMethod
  } catch (error) {
    console.error('Error detaching payment method:', error)
    throw new Error('Failed to detach payment method')
  }
}

export const cancelSubscription = async (subscriptionId, cancelAtPeriodEnd = true) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    })
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

export const retrieveSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    throw new Error('Failed to retrieve subscription')
  }
}

export const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    throw new Error('Failed to retrieve payment intent')
  }
}

// Export the stripe instance for direct use in API routes
export default stripe

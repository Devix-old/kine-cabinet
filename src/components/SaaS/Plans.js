'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Check, Star, Users, BarChart3, Building2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    currency: 'EUR',
    interval: 'mois',
    description: 'Parfait pour les cabinets débutants',
    features: [
      'Jusqu\'à 80 patients',
      'Gestion des rendez-vous',
      'Dossiers médicaux basiques',
      'Support email',
      'Sauvegarde automatique',
      'Interface mobile'
    ],
    popular: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 59,
    currency: 'EUR',
    interval: 'mois',
    description: 'Recommandé pour la plupart des cabinets',
    features: [
      'Jusqu\'à 200 patients',
      'Gestion avancée des RDV',
      'Dossiers médicaux complets',
      'Facturation automatisée',
      'Rapports et statistiques',
      'Support prioritaire',
      'API d\'intégration',
      'Formation personnalisée'
    ],
    popular: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'EUR',
    interval: 'mois',
    description: 'Pour les grandes structures',
    features: [
      'Patients illimités',
      'Tout du plan Professional',
      'Multi-cabinets',
      'Gestion des équipes',
      'Support dédié 24/7',
      'Intégrations avancées',
      'Formation sur site',
      'SLA garanti'
    ],
    popular: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID
  }
]

const planIcons = {
  starter: Users,
  professional: BarChart3,
  enterprise: Building2
}

export default function Plans() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  const handlePlanSelection = async (planId) => {
    if (!session?.user) {
      // For unauthenticated users, redirect to registration with plan
      window.location.href = `/auth/register?plan=${planId}`
      return
    }

    // For authenticated users, create Stripe checkout session
    setLoading(planId)
    setError('')

    try {
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // Create checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard/subscription-success?plan=${planId}`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session')
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const getButtonText = (planId) => {
    if (status === 'loading') return 'Chargement...'
    if (!session?.user) return 'Commencer l\'essai gratuit'
    if (loading === planId) return 'Redirection...'
    return 'Choisir ce plan'
  }

  const getButtonAction = (planId) => {
    if (!session?.user) {
      return () => window.location.href = `/auth/register?plan=${planId}`
    }
    return () => handlePlanSelection(planId)
  }

  return (
    <section id="plans" className="py-24 bg-gradient-to-br from-[#FBFBFB] via-[#F8FBFD] to-[#E6F1F7] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#4CB5B5]/10 to-[#7BC6B5]/8 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#4CB5B5]/8 to-[#DCEEF5]/12 rounded-full blur-lg animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-[#DCEEF5]/6 to-[#4CB5B5]/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-2 bg-[#DCEEF5]/30 border border-[#4CB5B5]/20 text-[#2F4A5C] text-sm font-medium rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-[#4CB5B5] rounded-full mr-2 inline-block"></span>
            Tarification Transparente
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#2F4A5C] via-[#4CB5B5] to-[#2F4A5C] bg-clip-text text-transparent mb-6"
            style={{ backgroundSize: "200% 200%" }}
          >
            Plans et Tarifs
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-[#3A5166] max-w-3xl mx-auto leading-relaxed"
          >
            Choisissez le plan qui correspond le mieux à vos besoins. 
            <span className="text-[#4CB5B5] font-semibold">Tous nos plans incluent un essai gratuit de 7 jours.</span>
          </motion.p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => {
            const IconComponent = planIcons[plan.id]
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl border transition-all duration-500 hover:shadow-2xl ${
                  plan.popular 
                    ? 'border-[#4CB5B5] shadow-xl shadow-[#4CB5B5]/20 scale-105' 
                    : 'border-[#DCEEF5] hover:border-[#4CB5B5]/50 hover:shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="bg-gradient-to-r from-[#4CB5B5] to-[#3DA4A4] text-white px-6 py-2 rounded-full text-sm font-medium flex items-center shadow-lg">
                      <Star className="w-4 h-4 mr-2" />
                      Le plus populaire
                    </div>
                  </motion.div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <motion.div 
                    className="flex justify-center mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      plan.popular 
                        ? 'bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4]' 
                        : 'bg-gradient-to-br from-[#DCEEF5] to-[#7BC6B5]'
                    } shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  
                  <h3 className={`text-2xl font-bold mb-3 ${
                    plan.popular ? 'text-[#2F4A5C]' : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </h3>
                  
                  <p className="text-[#3A5166] mb-6 leading-relaxed">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className={`text-5xl font-bold ${
                      plan.popular ? 'text-[#4CB5B5]' : 'text-gray-900'
                    }`}>
                      {plan.price}€
                    </span>
                    <span className="text-[#3A5166] ml-2 text-lg">/{plan.interval}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={featureIndex} 
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                    >
                      <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[#3A5166] text-sm leading-relaxed">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.button
                  onClick={getButtonAction(plan.id)}
                  disabled={loading === plan.id || status === 'loading'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#4CB5B5] to-[#3DA4A4] text-white hover:shadow-lg hover:shadow-[#4CB5B5]/30'
                      : 'bg-gradient-to-r from-[#DCEEF5] to-[#7BC6B5] text-[#2F4A5C] hover:shadow-lg hover:shadow-[#4CB5B5]/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {getButtonText(plan.id)}
                </motion.button>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-20"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-[#DCEEF5] max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#2F4A5C] mb-4">
              Besoin d'un plan personnalisé ?
            </h3>
            <p className="text-[#3A5166] mb-6 leading-relaxed">
              Pour plusieurs cabinets ou des besoins spécifiques, notre équipe commerciale 
              vous accompagne dans la création d'une solution sur mesure.
            </p>
            <Link href="/contact">
              <motion.button 
                className="bg-gradient-to-r from-[#4CB5B5] to-[#3DA4A4] text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg hover:shadow-[#4CB5B5]/30 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contacter l'équipe commerciale
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

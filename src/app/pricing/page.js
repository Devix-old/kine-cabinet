"use client"

import Header from '@/components/SaaS/Header'
import Footer from '@/components/SaaS/Footer'
import { motion } from 'framer-motion'
import { Check, Star, Crown, Clock, Users, BarChart3, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'

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

const faqs = [
  {
    question: "Y a-t-il un engagement sur la durée ?",
    answer: "Non, tous nos abonnements sont sans engagement. Vous pouvez annuler à tout moment."
  },
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre tableau de bord."
  },
  {
    question: "Les données sont-elles sécurisées ?",
    answer: "Absolument. Nous utilisons un chiffrement SSL/TLS et sommes conformes RGPD pour protéger vos données."
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer: "Non, le prix affiché est le prix final. Aucun frais caché ou de configuration."
  },
  {
    question: "Puis-je essayer avant d'acheter ?",
    answer: "Oui, nous offrons un essai gratuit de 7 jours avec toutes les fonctionnalités."
  },
  {
    question: "Le support technique est-il inclus ?",
    answer: "Oui, tous nos plans incluent le support technique. Le niveau de support varie selon le plan."
  }
]

export default function PricingPage() {
  const { data: session, status } = useSession()
  const [cabinetInfo, setCabinetInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [planLoading, setPlanLoading] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetchCabinetInfo()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchCabinetInfo = async () => {
    try {
      const response = await fetch('/api/cabinet')
      if (response.ok) {
        const data = await response.json()
        setCabinetInfo(data.cabinet)
      }
    } catch (error) {
      console.error('Error fetching cabinet info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelection = async (planId) => {
    if (!session?.user) {
      // For unauthenticated users, redirect to registration with plan
      window.location.href = `/auth/register?plan=${planId}`
      return
    }

    // For authenticated users, create Stripe checkout session
    setPlanLoading(planId)
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
      setPlanLoading(null)
    }
  }

  const getButtonText = (planId) => {
    if (status === 'loading') return 'Chargement...'
    if (!session?.user) return 'Commencer l\'essai gratuit'
    if (planLoading === planId) return 'Redirection...'
    return 'Choisir ce plan'
  }

  const getButtonAction = (planId) => {
    if (!session?.user) {
      return () => window.location.href = `/auth/register?plan=${planId}`
    }
    return () => handlePlanSelection(planId)
  }

  const getStatusBadge = () => {
    if (!cabinetInfo) return null

    if (cabinetInfo.isTrialActive) {
      const daysLeft = Math.ceil((new Date(cabinetInfo.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-blue-900 font-semibold">Essai gratuit actif</h3>
              <p className="text-blue-700 text-sm">
                {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''} • 
                Limite : {cabinetInfo.maxPatients} patients
              </p>
            </div>
          </div>
                     <div className="mt-3">
             <p className="text-blue-700 text-sm">
               Votre essai gratuit est actif. Vous pouvez choisir un plan à tout moment.
             </p>
           </div>
        </div>
      )
    } else {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-3">
            <Crown className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-green-900 font-semibold">Abonnement actif</h3>
              <p className="text-green-700 text-sm">
                Patients illimités • Accès complet à toutes les fonctionnalités
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Aller au tableau de bord
            </Link>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                Plans et Tarifs
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Choisissez le plan qui correspond le mieux à vos besoins. 
                Tous nos plans incluent un essai gratuit de 7 jours.
              </motion.p>
            </div>
          </div>
        </section>

        {/* User Status Section */}
        {session?.user && !loading && (
          <section className="py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {getStatusBadge()}
            </div>
          </section>
        )}

        {/* Error Message */}
        {error && (
          <section className="py-4 bg-red-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            </div>
          </section>
        )}

        {/* Pricing Plans */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => {
                const IconComponent = planIcons[plan.id]
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                      plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          Recommandé
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                        <span className="text-gray-600">/{plan.interval}</span>
                      </div>

                      <button
                        onClick={getButtonAction(plan.id)}
                        disabled={planLoading === plan.id || status === 'loading'}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {getButtonText(plan.id)}
                      </button>
                    </div>

                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions Fréquentes
              </h2>
              <p className="text-gray-600">
                Tout ce que vous devez savoir sur nos plans et tarifs
              </p>
            </div>

            <div className="grid gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Rejoignez des milliers de cabinets qui font confiance à notre plateforme
            </p>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Aller au tableau de bord
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Commencer l'essai gratuit
              </Link>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 
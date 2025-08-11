'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Check, Star, CreditCard, Users, BarChart3, Building2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    currency: 'EUR',
    interval: 'mois',
    features: [
      'Jusqu\'à 100 patients',
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
    features: [
      'Patients illimités',
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
    features: [
      'Tout du plan Professional',
      'Multi-cabinets',
      'Gestion des équipes',
      'Support dédié 24/7',
      'Intégrations avancées',
      'Formation sur site',
      'SLA garanti',
      'Personnalisation complète'
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

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cabinet, setCabinet] = useState(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login')
      return
    }

    // Fetch cabinet info
    const fetchCabinet = async () => {
      try {
        const response = await fetch('/api/cabinet')
        const data = await response.json()
        if (data.cabinet) {
          setCabinet(data.cabinet)
        }
      } catch (error) {
        console.error('Error fetching cabinet:', error)
      }
    }

    fetchCabinet()
  }, [session, status, router])

  const handleSubscribe = async (planId) => {
    setLoading(true)
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
           cancelUrl: `${window.location.origin}/billing`,
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
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Choisir votre plan</h1>
              <p className="mt-2 text-gray-600">
                Sélectionnez le plan qui correspond le mieux à vos besoins
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>

      {/* Trial Info */}
      {cabinet?.isTrialActive && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-blue-900 font-medium">
                  Votre essai gratuit se termine le {new Date(cabinet.trialEndDate).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-blue-700 text-sm">
                  Choisissez un plan pour continuer à utiliser KineCabinet sans interruption
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const IconComponent = planIcons[plan.id]
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-lg shadow-lg p-8 border-2 transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                      <Star className="h-4 w-4 mr-1" />
                      Le plus populaire
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
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                    <span className="text-gray-600 ml-1">/{plan.interval}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-3 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Chargement...' : 'Choisir ce plan'}
                </button>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Questions fréquentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Puis-je annuler à tout moment ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Y a-t-il des frais cachés ?
              </h3>
              <p className="text-gray-600">
                Non, le prix affiché est le prix final. Aucun frais caché ou de configuration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Puis-je changer de plan ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Le support est-il inclus ?
              </h3>
              <p className="text-gray-600">
                Oui, tous nos plans incluent le support technique. Le niveau varie selon le plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

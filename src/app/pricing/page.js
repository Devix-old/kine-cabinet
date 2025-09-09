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
        <section className="relative bg-gradient-to-br from-[#FBFBFB] to-[#E6F1F7] py-20 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#4CB5B5]/10 to-[#7BC6B5]/8 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#4CB5B5]/8 to-[#DCEEF5]/12 rounded-full blur-lg animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-[#DCEEF5]/6 to-[#4CB5B5]/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-block px-4 py-2 bg-[#DCEEF5]/30 border border-[#4CB5B5]/20 text-[#2F4A5C] text-sm font-medium rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-[#4CB5B5] rounded-full mr-2 inline-block"></span>
                Tarification Transparente
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#2F4A5C] via-[#4CB5B5] to-[#2F4A5C] bg-clip-text text-transparent mb-6"
                style={{ backgroundSize: "200% 200%" }}
              >
                Plans et Tarifs
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-[#3A5166] max-w-3xl mx-auto leading-relaxed"
              >
                Choisissez le plan qui correspond le mieux à vos besoins. 
                <span className="text-[#4CB5B5] font-semibold">Tous nos plans incluent un essai gratuit de 7 jours.</span>
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
        <section className="py-20 bg-gradient-to-br from-[#FBFBFB] via-[#F8FBFD] to-[#E6F1F7] relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#4CB5B5]/10 to-[#7BC6B5]/8 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#4CB5B5]/8 to-[#DCEEF5]/12 rounded-full blur-lg animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-[#DCEEF5]/6 to-[#4CB5B5]/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                      disabled={planLoading === plan.id || status === 'loading'}
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
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gradient-to-br from-[#FBFBFB] to-[#E6F1F7]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#2F4A5C] via-[#4CB5B5] to-[#2F4A5C] bg-clip-text text-transparent mb-4">
                Questions Fréquentes
              </h2>
              <p className="text-[#3A5166] text-lg">
                Tout ce que vous devez savoir sur nos plans et tarifs
              </p>
            </motion.div>

            <div className="grid gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#DCEEF5] hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold text-[#2F4A5C] mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-[#3A5166] leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#4CB5B5] to-[#3DA4A4] relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          </div>
          
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Prêt à commencer ?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white/90 mb-8 text-lg"
            >
              Rejoignez des milliers de cabinets qui font confiance à notre plateforme
            </motion.p>
            {session?.user ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link
                  href="/dashboard"
                  className="bg-white text-[#4CB5B5] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 inline-block shadow-lg hover:shadow-xl"
                >
                  Aller au tableau de bord
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link
                  href="/auth/register"
                  className="bg-white text-[#4CB5B5] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 inline-block shadow-lg hover:shadow-xl"
                >
                  Commencer l'essai gratuit
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 
"use client"

import Header from '@/components/SaaS/Header'
import Footer from '@/components/SaaS/Footer'
import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    price: '29',
    period: 'mois',
    description: 'Parfait pour les cabinets débutants',
    features: [
      'Jusqu\'à 100 patients',
      'Gestion des rendez-vous',
      'Dossiers médicaux basiques',
      'Support email',
      'Sauvegarde automatique',
      'Interface mobile'
    ],
    popular: false,
    cta: 'Commencer gratuitement',
    href: '/auth/register'
  },
  {
    name: 'Professional',
    price: '59',
    period: 'mois',
    description: 'Recommandé pour la plupart des cabinets',
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
    cta: 'Commencer gratuitement',
    href: '/auth/register'
  },
  {
    name: 'Enterprise',
    price: '99',
    period: 'mois',
    description: 'Pour les grandes structures',
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
    cta: 'Contacter les ventes',
    href: '/contact'
  }
]

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
    answer: "Oui, nous offrons un essai gratuit de 14 jours avec toutes les fonctionnalités."
  },
  {
    question: "Le support technique est-il inclus ?",
    answer: "Oui, tous nos plans incluent le support technique. Le niveau de support varie selon le plan."
  }
]

export default function PricingPage() {
  return (
    <div className="bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden bg-white pt-14">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-base font-semibold leading-7 text-blue-600"
              >
                Tarifs
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Des tarifs simples et transparents
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 text-lg leading-8 text-gray-600"
              >
                Choisissez le plan qui correspond le mieux à vos besoins. 
                Tous nos plans incluent un essai gratuit de 14 jours.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`relative bg-white p-8 rounded-2xl shadow-sm border ${
                    plan.popular 
                      ? 'border-blue-600 ring-2 ring-blue-600/20' 
                      : 'border-gray-200'
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
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                    
                    <div className="mt-8">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold tracking-tight text-gray-900">
                          {plan.price}€
                        </span>
                        <span className="text-sm text-gray-600 ml-1">/{plan.period}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-3 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8">
                    <Link
                      href={plan.href}
                      className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-base font-semibold leading-7 text-blue-600"
              >
                FAQ
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Questions fréquentes
              </motion.p>
            </div>
            
            <div className="mx-auto mt-16 max-w-4xl">
              <dl className="space-y-8">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-lg p-6 shadow-sm"
                  >
                    <dt className="text-lg font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </dt>
                    <dd className="text-gray-600">
                      {faq.answer}
                    </dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Prêt à commencer ?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100"
              >
                Rejoignez des centaines de kinésithérapeutes qui font confiance à KineCabinet 
                pour gérer leur cabinet plus efficacement.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-10 flex items-center justify-center gap-x-6"
              >
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-semibold leading-6 text-white hover:text-blue-100 transition-colors"
                >
                  Contacter l'équipe <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
} 
import Header from '@/components/SaaS/Header'
import Footer from '@/components/SaaS/Footer'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Shield,
  Zap,
  Clock,
  CheckCircle,
  Star,
  MessageSquare,
  Bell,
  Settings,
  Database,
  Smartphone,
  Globe
} from 'lucide-react'

const features = [
  {
    category: 'Gestion des patients',
    items: [
      {
        name: 'Base de données complète',
        description: 'Stockage sécurisé de toutes les informations patient avec historique médical complet.',
        icon: Database,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        name: 'Dossiers médicaux',
        description: 'Gestion des ordonnances, comptes-rendus et documents médicaux numérisés.',
        icon: FileText,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        name: 'Suivi des traitements',
        description: 'Historique détaillé des séances et progression des traitements.',
        icon: BarChart3,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      }
    ]
  },
  {
    category: 'Planification',
    items: [
      {
        name: 'Calendrier intelligent',
        description: 'Interface intuitive pour planifier et gérer les rendez-vous.',
        icon: Calendar,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        name: 'Rappels automatiques',
        description: 'Notifications SMS et email pour réduire les rendez-vous manqués.',
        icon: Bell,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      },
      {
        name: 'Gestion des créneaux',
        description: 'Optimisation des plannings avec gestion des disponibilités.',
        icon: Clock,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      }
    ]
  },
  {
    category: 'Administration',
    items: [
      {
        name: 'Facturation automatisée',
        description: 'Génération automatique des factures et suivi des paiements.',
        icon: CreditCard,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
      },
      {
        name: 'Communication patient',
        description: 'Messages personnalisés et notifications pour vos patients.',
        icon: MessageSquare,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50'
      },
      {
        name: 'Rapports et statistiques',
        description: 'Tableaux de bord détaillés pour analyser votre activité.',
        icon: BarChart3,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50'
      }
    ]
  },
  {
    category: 'Sécurité et conformité',
    items: [
      {
        name: 'Conformité RGPD',
        description: 'Protection des données de santé selon les normes européennes.',
        icon: Shield,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      },
      {
        name: 'Sauvegarde automatique',
        description: 'Sauvegarde sécurisée de toutes vos données en temps réel.',
        icon: Database,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        name: 'Accès multi-appareils',
        description: 'Accédez à vos données depuis ordinateur, tablette ou smartphone.',
        icon: Smartphone,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      }
    ]
  }
]

const benefits = [
  'Gain de temps de 30% sur l\'administration',
  'Réduction des rendez-vous manqués de 60%',
  'Amélioration de la satisfaction patient',
  'Conformité RGPD garantie',
  'Support technique 24/7',
  'Mises à jour automatiques',
  'Interface intuitive et moderne',
  'Synchronisation en temps réel'
]

export default function FeaturesPage() {
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
                Fonctionnalités
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Tout ce dont vous avez besoin pour votre cabinet
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 text-lg leading-8 text-gray-600"
              >
                Une suite complète d'outils conçus spécifiquement pour les kinésithérapeutes, 
                pour simplifier votre quotidien et améliorer les soins de vos patients.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="space-y-16">
              {features.map((category, categoryIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {category.category}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {category.items.map((feature, featureIndex) => (
                      <motion.div
                        key={feature.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: featureIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} mb-4`}>
                          <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {feature.name}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
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
                Avantages
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Pourquoi choisir KineCabinet ?
              </motion.p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-base font-semibold leading-7 text-blue-600"
              >
                Spécifications techniques
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Technologie moderne et fiable
              </motion.p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    <Globe className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Cloud sécurisé</h3>
                  </div>
                  <p className="text-gray-600">
                    Infrastructure cloud haute disponibilité avec sauvegarde automatique et réplication des données.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    <Shield className="h-8 w-8 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Sécurité maximale</h3>
                  </div>
                  <p className="text-gray-600">
                    Chiffrement SSL/TLS, authentification multi-facteurs et conformité RGPD complète.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    <Zap className="h-8 w-8 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Performance optimale</h3>
                  </div>
                  <p className="text-gray-600">
                    Temps de réponse ultra-rapide, interface responsive et synchronisation en temps réel.
                  </p>
                </motion.div>
              </div>
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
                Prêt à découvrir toutes nos fonctionnalités ?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100"
              >
                Commencez votre essai gratuit de 14 jours et explorez toutes les fonctionnalités de KineCabinet.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-10 flex items-center justify-center gap-x-6"
              >
                <a
                  href="/auth/register"
                  className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                >
                  Commencer gratuitement
                </a>
                <a
                  href="/contact"
                  className="text-sm font-semibold leading-6 text-white hover:text-blue-100 transition-colors"
                >
                  Demander une démo <span aria-hidden="true">→</span>
                </a>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
} 
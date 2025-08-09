"use client"

import Header from '@/components/SaaS/Header'
import Footer from '@/components/SaaS/Footer'
import { motion } from 'framer-motion'
import { 
  Users, 
  Target, 
  Award,
  Heart,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react'

const values = [
  {
    name: 'Innovation',
    description: 'Nous développons constamment de nouvelles fonctionnalités pour améliorer l\'expérience de nos utilisateurs.',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    name: 'Sécurité',
    description: 'La protection des données de santé est notre priorité absolue avec une conformité RGPD complète.',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    name: 'Excellence',
    description: 'Nous visons l\'excellence dans chaque aspect de notre service et de notre produit.',
    icon: Award,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    name: 'Empathie',
    description: 'Nous comprenons les défis quotidiens des kinésithérapeutes et concevons nos solutions en conséquence.',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
]

const team = [
  {
    name: 'Dr. Marie Dupont',
    role: 'CEO & Fondatrice',
    image: '/api/placeholder/150/150',
    bio: 'Kinésithérapeute de formation, Marie a créé KineCabinet pour moderniser la gestion des cabinets de kinésithérapie.',
    linkedin: '#'
  },
  {
    name: 'Thomas Martin',
    role: 'CTO',
    image: '/api/placeholder/150/150',
    bio: 'Expert en développement logiciel avec 10 ans d\'expérience dans les solutions de santé numérique.',
    linkedin: '#'
  },
  {
    name: 'Sophie Bernard',
    role: 'Directrice Produit',
    image: '/api/placeholder/150/150',
    bio: 'Spécialiste en expérience utilisateur et en conception de produits pour le secteur médical.',
    linkedin: '#'
  },
  {
    name: 'Jean Leroy',
    role: 'Directeur Commercial',
    image: '/api/placeholder/150/150',
    bio: 'Expert en développement commercial avec une expertise dans le secteur de la santé.',
    linkedin: '#'
  }
]

const stats = [
  { label: 'Cabinets utilisateurs', value: '500+' },
  { label: 'Patients gérés', value: '50,000+' },
  { label: 'Rendez-vous/mois', value: '15,000+' },
  { label: 'Satisfaction client', value: '98%' }
]

const milestones = [
  {
    year: '2020',
    title: 'Fondation',
    description: 'Création de KineCabinet par Marie Dupont, kinésithérapeute'
  },
  {
    year: '2021',
    title: 'Premier lancement',
    description: 'Sortie de la première version avec gestion des patients et rendez-vous'
  },
  {
    year: '2022',
    title: 'Expansion',
    description: 'Ajout de la facturation et des dossiers médicaux numériques'
  },
  {
    year: '2023',
    title: 'Croissance',
    description: 'Plus de 500 cabinets utilisateurs et 50,000 patients gérés'
  },
  {
    year: '2024',
    title: 'Innovation',
    description: 'Lancement de nouvelles fonctionnalités IA et intégrations avancées'
  }
]

export default function AboutPage() {
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
                À propos
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Notre mission
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 text-lg leading-8 text-gray-600"
              >
                Simplifier la gestion des cabinets de kinésithérapie pour permettre aux professionnels 
                de se concentrer sur l'essentiel : les soins de leurs patients.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Notre histoire
                </h2>
                <div className="mt-6 space-y-6 text-lg text-gray-600">
                  <p>
                    KineCabinet est né d'une frustration partagée par de nombreux kinésithérapeutes : 
                    la complexité et l'inefficacité des outils de gestion traditionnels.
                  </p>
                  <p>
                    En 2020, Marie Dupont, kinésithérapeute expérimentée, a décidé de créer une solution 
                    moderne et intuitive pour simplifier la gestion quotidienne des cabinets.
                  </p>
                  <p>
                    Aujourd'hui, KineCabinet aide plus de 500 cabinets à gérer efficacement leurs patients, 
                    leurs rendez-vous et leur activité, leur permettant de se concentrer sur leur mission principale.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-8"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Nos chiffres clés</h3>
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                      <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
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
                Nos valeurs
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Ce qui nous guide
              </motion.p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {values.map((value, index) => (
                  <motion.div
                    key={value.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-lg ${value.bgColor} mb-4`}>
                      <value.icon className={`h-8 w-8 ${value.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.name}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
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
                Notre équipe
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Les personnes derrière KineCabinet
              </motion.p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                {team.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 mb-2">{member.role}</p>
                    <p className="text-sm text-gray-600">{member.bio}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
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
                Notre parcours
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Les étapes de notre croissance
              </motion.p>
            </div>
            
            <div className="mx-auto mt-16 max-w-4xl">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-12">
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.year}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="relative flex items-start space-x-6"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-6 top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm"></div>
                      
                      <div className="ml-16">
                        <div className="text-sm font-semibold text-blue-600">{milestone.year}</div>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">{milestone.title}</h3>
                        <p className="text-gray-600 mt-2">{milestone.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
                Rejoignez notre mission
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100"
              >
                Découvrez comment KineCabinet peut transformer la gestion de votre cabinet 
                et vous permettre de vous concentrer sur vos patients.
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
                  Nous contacter <span aria-hidden="true">→</span>
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
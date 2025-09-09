'use client'

import { useState } from 'react'
import Header from '@/components/SaaS/Header'
import Footer from '@/components/SaaS/Footer'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Calendar,
  Headphones
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSubmitted(true)
    setLoading(false)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: ''
    })
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@kinecabinet.com',
      description: 'Nous répondons sous 24h',
      color: 'blue'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: '+33 1 23 45 67 89',
      description: 'Lun-Ven, 9h-18h',
      color: 'green'
    },
    {
      icon: Headphones,
      title: 'Support Live',
      content: 'Chat en direct',
      description: 'Support technique 24/7',
      color: 'purple'
    }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="pt-20 sm:pt-24 pb-16 sm:pb-24">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="text-center bg-white rounded-2xl shadow-xl p-8 sm:p-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-green-100 mb-6 sm:mb-8"
              >
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-4"
              >
                Message envoyé !
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-base sm:text-lg leading-relaxed text-gray-600 mb-6 sm:mb-8"
              >
                Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Envoyer un autre message
              </motion.button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <main className="pt-20 sm:pt-24">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6 sm:mb-8"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Contactez-nous
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4 sm:mb-6"
            >
              Parlons de votre 
              <span className="text-blue-600 block sm:inline"> projet ensemble</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Notre équipe d'experts est là pour vous accompagner dans la transformation 
              numérique de votre cabinet de kinésithérapie.
            </motion.p>
          </div>

          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto max-w-4xl mt-12 sm:mt-16"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100"
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    method.color === 'blue' ? 'bg-blue-100' :
                    method.color === 'green' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    <method.icon className={`w-6 h-6 ${
                      method.color === 'blue' ? 'text-blue-600' :
                      method.color === 'green' ? 'text-green-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{method.title}</h3>
                  <p className="text-gray-700 font-medium mb-1">{method.content}</p>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="lg:col-span-2"
              >
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Envoyez-nous un message
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-300 text-[#2F4A5C] placeholder-[#3A5166]"
                          placeholder="Votre prénom"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-300 text-[#2F4A5C] placeholder-[#3A5166]"
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-300 text-[#2F4A5C] placeholder-[#3A5166]"
                          placeholder="votre.email@exemple.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-300 text-[#2F4A5C] placeholder-[#3A5166]"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                        Cabinet / Entreprise
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-300 text-gray-900 placeholder-gray-500"
                        placeholder="Nom de votre cabinet"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                        Sujet *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-300 text-[#2F4A5C] bg-white"
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="demo">Demande de démo</option>
                        <option value="pricing">Question sur les tarifs</option>
                        <option value="support">Support technique</option>
                        <option value="partnership">Partenariat</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-300 text-[#2F4A5C] placeholder-[#3A5166] resize-none"
                        placeholder="Décrivez votre projet ou votre question en détail..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Sidebar Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* Office Hours */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Horaires d'ouverture</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Lundi - Vendredi</span>
                      <span className="font-medium text-gray-900">9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Samedi</span>
                      <span className="font-medium text-gray-900">10h00 - 16h00</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Dimanche</span>
                      <span className="font-medium text-red-600">Fermé</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <MapPin className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Notre adresse</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    123 Rue de la Paix<br />
                    75001 Paris, France
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Métro : Châtelet-Les Halles (Lignes 1, 4, 7, 11, 14)
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Pourquoi nous choisir ?</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Réponse sous 24h garantie</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Support technique 24/7</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>+500 cabinets accompagnés</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Formation incluse</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
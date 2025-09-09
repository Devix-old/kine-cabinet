"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  User, 
  Lock, 
  CreditCard, 
  Settings,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import SubscriptionInfo from '@/components/SubscriptionInfo'
import Header from '@/components/SaaS/Header'
import Footer from '@/components/SaaS/Footer'

export default function ComptePage() {
  const { data: session, update } = useSession()
  const [cabinetInfo, setCabinetInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (session?.user) {
      fetchCabinetInfo()
      setFormData({
        name: session.user.name || '',
        email: session.user.email || ''
      })
    }
  }, [session])

  const fetchCabinetInfo = async () => {
    try {
      const response = await fetch('/api/cabinet')
      if (response.ok) {
        const data = await response.json()
        setCabinetInfo(data.cabinet || data)
      }
    } catch (error) {
      console.error('Error fetching cabinet info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
        // Update session
        await update()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erreur lors de la mise à jour' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
      return
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erreur lors de la mise à jour' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    }
  }



  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Mot de passe', icon: Lock },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-[#FBFBFB] to-[#E6F1F7] relative overflow-hidden pt-20">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#4CB5B5]/10 to-[#7BC6B5]/8 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#4CB5B5]/8 to-[#DCEEF5]/12 rounded-full blur-lg animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-[#DCEEF5]/6 to-[#4CB5B5]/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#2F4A5C] via-[#4CB5B5] to-[#2F4A5C] bg-clip-text text-transparent mb-4">
                Mon Compte
              </h1>
              <p className="text-xl text-[#3A5166] max-w-2xl mx-auto">
                Gérez vos informations personnelles et votre abonnement
              </p>
            </motion.div>

        {/* Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </motion.div>
        )}

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-[#4CB5B5] to-[#3DA4A4] text-white shadow-lg shadow-[#4CB5B5]/30'
                            : 'text-[#3A5166] hover:bg-white/60 hover:shadow-md border border-transparent hover:border-[#4CB5B5]/20'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </motion.button>
                    )
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="lg:col-span-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#DCEEF5]"
                >
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="p-8">
                      <h2 className="text-2xl font-bold text-[#2F4A5C] mb-8">Informations du profil</h2>
                      
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-[#3A5166] mb-3">
                            Nom complet
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-[#DCEEF5] rounded-xl focus:ring-2 focus:ring-[#4CB5B5] focus:border-[#4CB5B5] transition-all duration-300 bg-white/50"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#3A5166] mb-3">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-[#DCEEF5] rounded-xl focus:ring-2 focus:ring-[#4CB5B5] focus:border-[#4CB5B5] transition-all duration-300 bg-white/50"
                            required
                          />
                        </div>

                        <div className="flex justify-end">
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-[#4CB5B5] to-[#3DA4A4] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#4CB5B5]/30 transition-all duration-300"
                          >
                            Mettre à jour
                          </motion.button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Password Tab */}
                  {activeTab === 'password' && (
                    <div className="p-8">
                      <h2 className="text-2xl font-bold text-[#2F4A5C] mb-8">Changer le mot de passe</h2>
                      
                      <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-[#3A5166] mb-3">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-[#DCEEF5] rounded-xl focus:ring-2 focus:ring-[#4CB5B5] focus:border-[#4CB5B5] transition-all duration-300 bg-white/50"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#3A5166] mb-3">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-[#DCEEF5] rounded-xl focus:ring-2 focus:ring-[#4CB5B5] focus:border-[#4CB5B5] transition-all duration-300 bg-white/50"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#3A5166] mb-3">
                            Confirmer le nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-[#DCEEF5] rounded-xl focus:ring-2 focus:ring-[#4CB5B5] focus:border-[#4CB5B5] transition-all duration-300 bg-white/50"
                            required
                          />
                        </div>

                        <div className="flex justify-end">
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-[#4CB5B5] to-[#3DA4A4] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#4CB5B5]/30 transition-all duration-300"
                          >
                            Changer le mot de passe
                          </motion.button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Subscription Tab */}
                  {activeTab === 'subscription' && (
                    <div className="p-8">
                      <h2 className="text-2xl font-bold text-[#2F4A5C] mb-8">Gestion de l'abonnement</h2>
                      
                      {/* Subscription Information Component */}
                      <div className="mb-8">
                        <SubscriptionInfo />
                      </div>

                      <div className="space-y-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            href="/billing"
                            className="flex items-center justify-between p-6 bg-gradient-to-r from-[#DCEEF5]/30 to-[#7BC6B5]/20 rounded-xl hover:from-[#4CB5B5]/20 hover:to-[#3DA4A4]/20 transition-all duration-300 border border-[#DCEEF5] hover:border-[#4CB5B5]/30"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4] rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-[#2F4A5C]">Gérer l'abonnement</h3>
                                <p className="text-sm text-[#3A5166]">Changer de plan ou annuler</p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-[#4CB5B5]" />
                          </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            href="/pricing"
                            className="flex items-center justify-between p-6 bg-gradient-to-r from-[#DCEEF5]/30 to-[#7BC6B5]/20 rounded-xl hover:from-[#4CB5B5]/20 hover:to-[#3DA4A4]/20 transition-all duration-300 border border-[#DCEEF5] hover:border-[#4CB5B5]/30"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4] rounded-lg flex items-center justify-center">
                                <Settings className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-[#2F4A5C]">Voir tous les plans</h3>
                                <p className="text-sm text-[#3A5166]">Comparer les fonctionnalités</p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-[#4CB5B5]" />
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

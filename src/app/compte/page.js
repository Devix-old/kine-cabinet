"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  User, 
  Lock, 
  CreditCard, 
  Calendar, 
  Crown, 
  Clock, 
  Users,
  Settings,
  ArrowRight,
  Check,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

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
        setCabinetInfo(data.cabinet)
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

  const getSubscriptionStatus = () => {
    if (!cabinetInfo) return null

    if (cabinetInfo.isTrialActive) {
      const daysLeft = Math.ceil((new Date(cabinetInfo.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))
      return {
        type: 'trial',
        title: 'Essai gratuit actif',
        description: `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`,
        limit: `${cabinetInfo.maxPatients} patients maximum`,
        icon: Clock,
        color: 'blue'
      }
    } else {
      return {
        type: 'active',
        title: 'Abonnement actif',
        description: 'Patients illimités',
        limit: 'Accès complet à toutes les fonctionnalités',
        icon: Crown,
        color: 'green'
      }
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

  const subscriptionStatus = getSubscriptionStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Compte</h1>
          <p className="text-gray-600 mt-2">Gérez vos informations personnelles et votre abonnement</p>
        </div>

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
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations du profil</h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Mettre à jour
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Changer le mot de passe</h2>
                  
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Changer le mot de passe
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion de l'abonnement</h2>
                  
                  {subscriptionStatus && (
                    <div className={`bg-${subscriptionStatus.color}-50 border border-${subscriptionStatus.color}-200 rounded-lg p-6 mb-6`}>
                      <div className="flex items-start space-x-4">
                        <subscriptionStatus.icon className={`w-8 h-8 text-${subscriptionStatus.color}-600 mt-1`} />
                        <div className="flex-1">
                          <h3 className={`text-${subscriptionStatus.color}-900 font-semibold text-lg`}>
                            {subscriptionStatus.title}
                          </h3>
                          <p className={`text-${subscriptionStatus.color}-700 mt-1`}>
                            {subscriptionStatus.description}
                          </p>
                          <p className={`text-${subscriptionStatus.color}-600 text-sm mt-2`}>
                            {subscriptionStatus.limit}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Link
                      href="/billing"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">Gérer l'abonnement</h3>
                          <p className="text-sm text-gray-600">Changer de plan ou annuler</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link
                      href="/pricing"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Settings className="w-5 h-5 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">Voir tous les plans</h3>
                          <p className="text-sm text-gray-600">Comparer les fonctionnalités</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>

                  {cabinetInfo?.isTrialActive && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h3 className="text-yellow-900 font-medium">Essai gratuit en cours</h3>
                          <p className="text-yellow-700 text-sm mt-1">
                            Votre essai gratuit se termine bientôt. Choisissez un plan pour continuer à utiliser toutes les fonctionnalités.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

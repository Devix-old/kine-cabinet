'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CreditCard, X, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export default function TrialBanner({ cabinet, onClose }) {
  const [isVisible, setIsVisible] = useState(true)
  const [daysLeft, setDaysLeft] = useState(0)
  const [patientsCount, setPatientsCount] = useState(0)

  useEffect(() => {
    if (cabinet?.trialEndDate) {
      const endDate = new Date(cabinet.trialEndDate)
      const now = new Date()
      const diffTime = endDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysLeft(diffDays)
    }
  }, [cabinet])

  useEffect(() => {
    // Fetch patients count
    const fetchPatientsCount = async () => {
      try {
        const response = await fetch('/api/patients/count')
        const data = await response.json()
        if (data.count !== undefined) {
          setPatientsCount(data.count)
        }
      } catch (error) {
        console.error('Error fetching patients count:', error)
      }
    }

    fetchPatientsCount()
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible || !cabinet?.isTrialActive) {
    return null
  }

  const isExpiringSoon = daysLeft <= 3
  const isExpired = daysLeft <= 0
  const isNearPatientLimit = patientsCount >= (cabinet.maxPatients * 0.8)

  if (isExpired) {
    return (
      <div className="bg-red-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Votre essai gratuit a expiré</p>
              <p className="text-sm opacity-90">Passez à un abonnement pour continuer à utiliser KineCabinet</p>
            </div>
          </div>
          <Link
            href="/billing"
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Choisir un plan
          </Link>
        </div>
      </div>
    )
  }

  if (isExpiringSoon) {
    return (
      <div className="bg-orange-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5" />
            <div>
              <p className="font-semibold">
                Votre essai gratuit se termine dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}
              </p>
              <p className="text-sm opacity-90">
                Ajoutez votre carte de crédit pour continuer sans interruption
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/billing"
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Choisir un plan
            </Link>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isNearPatientLimit) {
    return (
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5" />
            <div>
              <p className="font-semibold">
                Limite de patients atteinte ({patientsCount}/{cabinet.maxPatients})
              </p>
              <p className="text-sm opacity-90">
                Passez à un plan supérieur pour ajouter plus de patients
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/billing"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Voir les plans
            </Link>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default trial banner
  return (
    <div className="bg-green-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-5 w-5" />
          <div>
            <p className="font-semibold">
              Essai gratuit de 7 jours - {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}
            </p>
            <p className="text-sm opacity-90">
              Ajoutez votre carte de crédit pour continuer après l'essai
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/billing"
            className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Choisir un plan
          </Link>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

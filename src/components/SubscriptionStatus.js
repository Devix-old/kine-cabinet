'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Clock, Crown, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SubscriptionStatus() {
  const { data: session } = useSession()
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (session?.user?.cabinetId) {
      fetchSubscriptionStatus()
    }
  }, [session])

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cabinet/subscription-status')
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status')
      }
      
      const data = await response.json()
      setSubscriptionInfo(data)
    } catch (err) {
      console.error('Error fetching subscription status:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Chargement...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <AlertTriangle className="h-4 w-4" />
        <span>Erreur de chargement</span>
      </div>
    )
  }

  if (!subscriptionInfo?.hasSubscription) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <AlertTriangle className="h-4 w-4" />
        <span>Aucun abonnement trouvé</span>
      </div>
    )
  }

  const { planName, status, daysLeft, daysLeftFormatted, isExpired, isTrial, isActive, maxPatients } = subscriptionInfo

  const getStatusIcon = () => {
    if (isExpired) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (isTrial) return <Clock className="h-4 w-4 text-yellow-500" />
    if (isActive) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <Crown className="h-4 w-4 text-blue-500" />
  }

  const getStatusColor = () => {
    if (isExpired) return 'text-red-600'
    if (isTrial) return 'text-yellow-600'
    if (isActive) return 'text-green-600'
    return 'text-blue-600'
  }

  const getStatusText = () => {
    if (isExpired) return 'Expiré'
    if (isTrial) return 'Essai gratuit'
    if (isActive) return 'Actif'
    return status
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className={`font-medium ${getStatusColor()}`}>
          {planName} - {getStatusText()}
        </span>
        <span className="text-xs text-gray-500">
          {daysLeftFormatted} • {maxPatients} patients max
        </span>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Crown, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Users,
  Zap
} from 'lucide-react'

export default function SubscriptionInfo() {
  const { data: session } = useSession()
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (session?.user?.cabinetId) {
      fetchSubscriptionInfo()
    }
  }, [session])

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cabinet/subscription-status')
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status')
      }
      
      const data = await response.json()
      setSubscriptionInfo(data)
    } catch (err) {
      console.error('Error fetching subscription info:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusIcon = () => {
    if (!subscriptionInfo?.hasSubscription) return <AlertTriangle className="w-5 h-5 text-gray-500" />
    
    if (subscriptionInfo.isExpired) return <AlertTriangle className="w-5 h-5 text-red-500" />
    if (subscriptionInfo.displayStatus === 'TRIALING_WITH_PAID_PLAN') return <Crown className="w-5 h-5 text-blue-500" />
    if (subscriptionInfo.isTrial) return <Clock className="w-5 h-5 text-yellow-500" />
    if (subscriptionInfo.isActive) return <CheckCircle className="w-5 h-5 text-green-500" />
    
    return <Crown className="w-5 h-5 text-blue-500" />
  }

  const getStatusColor = () => {
    if (!subscriptionInfo?.hasSubscription) return 'gray'
    if (subscriptionInfo.isExpired) return 'red'
    if (subscriptionInfo.displayStatus === 'TRIALING_WITH_PAID_PLAN') return 'blue'
    if (subscriptionInfo.isTrial) return 'yellow'
    if (subscriptionInfo.isActive) return 'green'
    return 'blue'
  }

  const getStatusText = () => {
    if (!subscriptionInfo?.hasSubscription) return 'Aucun abonnement'
    if (subscriptionInfo.isExpired) return 'Expiré'
    if (subscriptionInfo.displayStatus === 'TRIALING_WITH_PAID_PLAN') return 'Essai + Plan'
    if (subscriptionInfo.isTrial) return 'Essai gratuit'
    if (subscriptionInfo.isActive) return 'Actif'
    return subscriptionInfo.status || 'Inconnu'
  }

  const getStatusMessage = () => {
    if (!subscriptionInfo?.hasSubscription) return 'Aucun abonnement actif trouvé'
    if (subscriptionInfo.isExpired) return 'Votre abonnement a expiré. Renouvelez-le pour continuer.'
    if (subscriptionInfo.isTrial) return 'Vous êtes actuellement en essai gratuit'
    if (subscriptionInfo.isActive) return 'Votre abonnement est actif'
    return subscriptionInfo.statusMessage || 'Statut de votre abonnement'
  }

  const getMaxPatientsText = () => {
    if (!subscriptionInfo?.hasSubscription) return 'Aucune limite'
    const maxPatients = subscriptionInfo.maxPatients
    if (maxPatients === -1) return 'Illimité'
    if (maxPatients === 0) return 'Aucune limite'
    return `${maxPatients} patients maximum`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="text-red-900 font-medium">Erreur de chargement</h3>
            <p className="text-red-700 text-sm mt-1">
              Impossible de charger les informations d'abonnement
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!subscriptionInfo?.hasSubscription) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="text-gray-900 font-medium">Aucun abonnement trouvé</h3>
            <p className="text-gray-600 text-sm mt-1">
              Aucun abonnement actif n'a été trouvé pour ce cabinet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const statusColor = getStatusColor()
  const statusText = getStatusText()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                   {/* Header */}
             <div className="flex items-center justify-between mb-6">
               <div>
                 <h3 className="text-lg font-semibold text-gray-900">
                   Informations d'abonnement
                 </h3>
                 <p className="text-sm text-gray-600 mt-1">
                   {getStatusMessage()}
                 </p>
               </div>
               <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                 {getStatusIcon()}
                 <span>{statusText}</span>
               </div>
             </div>

      {/* Subscription Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Crown className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Plan</p>
              <p className="text-lg font-semibold text-gray-900">
                {subscriptionInfo.planName || 'Plan inconnu'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Limite de patients</p>
              <p className="text-lg font-semibold text-gray-900">
                {getMaxPatientsText()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Jour actuel</p>
              <p className="text-lg font-semibold text-gray-900">
                {subscriptionInfo.currentDate ? formatDate(subscriptionInfo.currentDate) : 'Non défini'}
              </p>
            </div>
          </div>
        </div>

        {/* Period Information */}
        <div className="space-y-4">
          {/* Trial Period Information */}
          {subscriptionInfo.isInTrialPeriod && (
            <>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Jours restants d'essai</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {subscriptionInfo.trialDaysLeftFormatted || 'Non défini'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Fin de l'essai</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {subscriptionInfo.trialEndDate ? formatDate(subscriptionInfo.trialEndDate) : 'Non défini'}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Paid Period Information */}
          {subscriptionInfo.hasPaidPlanSelected && (
            <>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Début de l'abonnement payant</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {subscriptionInfo.paidPeriodStartDate ? formatDate(subscriptionInfo.paidPeriodStartDate) : 'Non défini'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Fin de l'abonnement payant</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {subscriptionInfo.paidPeriodEndDate ? formatDate(subscriptionInfo.paidPeriodEndDate) : 'Non défini'}
                  </p>
                </div>
              </div>

              {subscriptionInfo.isInPaidPeriod && (
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Jours restants payants</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {subscriptionInfo.paidDaysLeftFormatted || 'Non défini'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Fallback for simple subscriptions */}
          {!subscriptionInfo.isInTrialPeriod && !subscriptionInfo.hasPaidPlanSelected && (
            <>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Début de l'abonnement</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(subscriptionInfo.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Fin de l'abonnement</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(subscriptionInfo.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Jours restants</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {subscriptionInfo.daysLeftFormatted || 'Non défini'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {subscriptionInfo.isExpired && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <h4 className="text-red-900 font-medium">Abonnement expiré</h4>
              <p className="text-red-700 text-sm mt-1">
                Votre abonnement a expiré. Renouvelez-le pour continuer à utiliser toutes les fonctionnalités.
              </p>
            </div>
          </div>
        </div>
      )}

      {subscriptionInfo.isTrial && subscriptionInfo.daysLeft <= 3 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div>
              <h4 className="text-yellow-900 font-medium">Essai gratuit se termine bientôt</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Votre essai gratuit se termine dans {subscriptionInfo.daysLeft} jour{subscriptionInfo.daysLeft > 1 ? 's' : ''}. 
                Choisissez un plan pour continuer.
              </p>
            </div>
          </div>
        </div>
      )}

      {subscriptionInfo.cancelAtPeriodEnd && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div>
              <h4 className="text-orange-900 font-medium">Abonnement annulé</h4>
              <p className="text-orange-700 text-sm mt-1">
                Votre abonnement a été annulé et se terminera à la fin de la période en cours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

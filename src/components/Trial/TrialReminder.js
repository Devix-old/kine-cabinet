'use client'

import { useState, useEffect } from 'react'
import { Clock, X } from 'lucide-react'
import Link from 'next/link'

export default function TrialReminder() {
  const [isVisible, setIsVisible] = useState(true)
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        const response = await fetch('/api/cabinet/subscription-status')
        if (response.ok) {
          const data = await response.json()
          setSubscriptionInfo(data)
        }
      } catch (error) {
        console.error('Error fetching subscription info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscriptionInfo()
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Save dismissal in localStorage with timestamp (persists but can be reset)
    const dismissalData = {
      dismissed: true,
      timestamp: Date.now()
    }
    localStorage.setItem('trial_reminder_dismissed', JSON.stringify(dismissalData))
  }

  // Check if user dismissed the reminder recently (within 2 minutes for testing)
  useEffect(() => {
    const dismissalData = localStorage.getItem('trial_reminder_dismissed')
    if (dismissalData) {
      try {
        const parsed = JSON.parse(dismissalData)
        const minutesSinceDismissal = (Date.now() - parsed.timestamp) / (1000 * 60)
        
        // If dismissed less than 2 minutes ago, keep it hidden
        if (parsed.dismissed && minutesSinceDismissal < 2) {
          setIsVisible(false)
        }
      } catch (error) {
        // If parsing fails, remove the invalid data
        localStorage.removeItem('trial_reminder_dismissed')
      }
    }
  }, [])

  // Don't show if loading, not visible, or not in trial
  if (isLoading || !isVisible || !subscriptionInfo?.isTrial) {
    return null
  }

  const daysLeft = subscriptionInfo.daysLeft || 0

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">
                Période d'essai
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {daysLeft > 0 
                  ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`
                  : 'Essai expiré'
                }
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 transition-colors"
              >
                Choisir un plan →
              </Link>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

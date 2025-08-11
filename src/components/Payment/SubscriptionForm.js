'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useToastContext } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'
import { SUBSCRIPTION_PLANS, getSupportedPaymentMethods, formatAmount } from '@/lib/stripe'
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Star,
  Users,
  Calendar,
  BarChart3,
  FileText,
  CreditCard as CreditCardIcon,
  Activity,
  MessageSquare,
  Building2
} from 'lucide-react'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const planIcons = {
  starter: Users,
  professional: BarChart3,
  enterprise: Building2
}

const SubscriptionFormContent = ({ 
  selectedPlan = 'professional',
  country = 'MA',
  onSuccess,
  onError 
}) => {
  const [plan, setPlan] = useState(selectedPlan)
  const [isYearly, setIsYearly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const stripe = useStripe()
  const elements = useElements()
  const { success: showSuccess, error: showError } = useToastContext()
  const router = useRouter()

  const selectedPlanData = SUBSCRIPTION_PLANS[plan]
  const price = isYearly ? selectedPlanData.price * 10 : selectedPlanData.price // 2 months free for yearly
  const period = isYearly ? 'an' : 'mois'

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create subscription
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan,
          country,
          metadata: {
            isYearly,
            period
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de l\'abonnement')
      }

      if (data.requiresAction) {
        // Handle 3D Secure or other authentication
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          clientSecret: data.clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/dashboard?subscription_id=${data.subscription.id}`,
          },
        })

        if (confirmError) {
          throw new Error(confirmError.message)
        }
      } else {
        // Subscription created successfully
        showSuccess('Abonnement créé avec succès!')
        onSuccess?.(data.subscription)
        router.push('/dashboard')
      }

    } catch (err) {
      console.error('Subscription error:', err)
      setError(err.message)
      showError(err.message)
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Plan Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Choisissez votre plan
        </h2>
        
        {/* Billing Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Annuel
              <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, planData]) => {
            const IconComponent = planIcons[planKey]
            const isSelected = plan === planKey
            const planPrice = isYearly ? planData.price * 10 : planData.price
            
            return (
              <div
                key={planKey}
                onClick={() => setPlan(planKey)}
                className={`relative p-6 border rounded-xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {planData.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Populaire
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {planData.name}
                  </h3>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatAmount(planPrice, planData.currency)}
                    </span>
                    <span className="text-gray-600">/{period}</span>
                  </div>
                  
                  <ul className="space-y-2 text-sm text-gray-600">
                    {planData.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations de paiement
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Plan Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">
                  {selectedPlanData.name} - {isYearly ? 'Annuel' : 'Mensuel'}
                </h4>
                <p className="text-sm text-gray-600">
                  {formatAmount(price, selectedPlanData.currency)}/{period}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatAmount(price, selectedPlanData.currency)}
                </div>
                <div className="text-sm text-gray-600">par {period}</div>
              </div>
            </div>
          </div>

          {/* Card Element */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Informations de carte
            </label>
            <div className="border border-gray-300 rounded-lg p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !stripe}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Création de l'abonnement...
              </>
            ) : (
              <>
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Commencer l'essai gratuit
              </>
            )}
          </button>

          {/* Terms and Security */}
          <div className="text-center text-xs text-gray-500 space-y-2">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Paiement sécurisé par Stripe
            </div>
            <p>
              Essai gratuit de 14 jours. Annulez à tout moment.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

const SubscriptionForm = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionFormContent {...props} />
    </Elements>
  )
}

export default SubscriptionForm

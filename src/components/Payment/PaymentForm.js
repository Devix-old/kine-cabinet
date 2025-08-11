'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useToastContext } from '@/contexts/ToastContext'
import { getSupportedPaymentMethods, formatAmount } from '@/lib/stripe'
import { 
  CreditCard, 
  Bank, 
  Smartphone, 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
const PaymentFormContent = ({ 
  amount, 
  currency = 'EUR', 
  onSuccess, 
  onError, 
  description,
  metadata = {},
  country = 'MA'
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const stripe = useStripe()
  const elements = useElements()
  const { success: showSuccess, error: showError } = useToastContext()

  const supportedMethods = getSupportedPaymentMethods(country)

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          paymentMethodType: paymentMethod,
          metadata: {
            ...metadata,
            country
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement')
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: data.paymentIntent.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?payment_id=${data.payment.id}`,
        },
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      showSuccess('Paiement traité avec succès!')
      onSuccess?.(data.payment)

    } catch (err) {
      console.error('Payment error:', err)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Méthode de paiement
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(supportedMethods).map(([key, method]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPaymentMethod(key)}
              className={`p-3 border rounded-lg text-center transition-all ${
                paymentMethod === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">{method.icon}</div>
              <div className="text-xs font-medium">{method.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Amount Display */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Montant à payer:</span>
          <span className="text-xl font-bold text-gray-900">
            {formatAmount(amount, currency)}
          </span>
        </div>
        {description && (
          <div className="mt-2 text-sm text-gray-500">
            {description}
          </div>
        )}
      </div>

      {/* Card Element for Stripe */}
      {paymentMethod === 'card' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Informations de carte
          </label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      )}

      {/* Other Payment Methods */}
      {paymentMethod !== 'card' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              Le paiement par {supportedMethods[paymentMethod]?.name} sera traité après confirmation.
            </span>
          </div>
        </div>
      )}

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
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Payer {formatAmount(amount, currency)}
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500">
        <div className="flex items-center justify-center">
          <CheckCircle className="h-4 w-4 mr-1" />
          Paiement sécurisé par Stripe
        </div>
      </div>
    </form>
  )
}

const PaymentForm = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  )
}

export default PaymentForm

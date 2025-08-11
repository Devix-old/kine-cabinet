'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Download, Mail } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentId = searchParams.get('payment_id')

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails()
    } else {
      setLoading(false)
    }
  }, [paymentId])

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`)
      if (response.ok) {
        const data = await response.json()
        setPayment(data.payment)
      }
    } catch (error) {
      console.error('Error fetching payment details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-gray-600">
            Votre transaction a été traitée avec succès.
          </p>
        </div>

        {/* Payment Details */}
        {payment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Détails du paiement</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant:</span>
                <span className="font-medium">
                  {payment.amount} {payment.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Méthode:</span>
                <span className="font-medium">{payment.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut:</span>
                <span className="font-medium text-green-600">Payé</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Prochaines étapes</h3>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Email de confirmation
                </p>
                <p className="text-xs text-blue-700">
                  Un email de confirmation vous a été envoyé
                </p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Accès immédiat
                </p>
                <p className="text-xs text-green-700">
                  Votre compte est maintenant actif
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <Link
            href="/dashboard"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Accéder au dashboard
          </Link>
          
          <button
            onClick={() => window.print()}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Télécharger le reçu
          </button>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Besoin d'aide ?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contactez notre support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

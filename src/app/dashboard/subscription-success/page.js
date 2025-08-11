'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckCircle, CreditCard, Users, Calendar, Star } from 'lucide-react'

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cabinet, setCabinet] = useState(null)
  const [loading, setLoading] = useState(true)

  const plan = searchParams.get('plan')
  const mock = searchParams.get('mock')
  const subscription = searchParams.get('subscription')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login')
      return
    }

    const fetchCabinet = async () => {
      try {
        const response = await fetch('/api/cabinet')
        const data = await response.json()
                 if (data.cabinet) {
           setCabinet(data.cabinet)
         }
      } catch (error) {
        console.error('Error fetching cabinet:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCabinet()
  }, [session, status, router])

  const getPlanDetails = (planId) => {
    const plans = {
      starter: {
        name: 'Starter',
        price: '29€',
        patients: '100 patients',
        features: ['Gestion des rendez-vous', 'Dossiers médicaux basiques', 'Support email']
      },
      professional: {
        name: 'Professional',
        price: '59€',
        patients: 'Patients illimités',
        features: ['Gestion avancée des RDV', 'Dossiers médicaux complets', 'Facturation automatisée', 'Rapports et statistiques']
      },
      enterprise: {
        name: 'Enterprise',
        price: '99€',
        patients: 'Multi-cabinets',
        features: ['Tout du plan Professional', 'Multi-cabinets', 'Gestion des équipes', 'Support dédié 24/7']
      }
    }
    return plans[planId] || plans.professional
  }

  const planDetails = getPlanDetails(plan)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {mock ? 'Test de paiement réussi !' : 'Abonnement activé avec succès !'}
          </h1>
          <p className="text-lg text-gray-600">
            {mock 
              ? 'Le test de paiement a fonctionné. Votre abonnement sera activé une fois les vrais Price IDs configurés.'
              : 'Votre abonnement est maintenant actif et votre essai gratuit a été converti.'
            }
          </p>
        </div>

        {/* Plan Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{planDetails.name}</h2>
              <p className="text-gray-600">Plan sélectionné</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{planDetails.price}</div>
              <div className="text-gray-600">par mois</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">{planDetails.patients}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Facturation mensuelle</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités incluses :</h3>
            <ul className="space-y-2">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cabinet Status */}
        {cabinet && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Statut de votre cabinet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${cabinet.isTrialActive ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                <span className="text-gray-700">
                  {cabinet.isTrialActive ? 'Essai gratuit actif' : 'Abonnement actif'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">
                  Limite : {cabinet.maxPatients} patients
                </span>
              </div>
              {cabinet.isTrialActive && cabinet.trialEndDate && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span className="text-gray-700">
                    Essai jusqu'au : {new Date(cabinet.trialEndDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Prochaines étapes</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="text-blue-900 font-medium">Configurez votre cabinet</p>
                <p className="text-blue-700 text-sm">Ajoutez vos informations et paramètres</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="text-blue-900 font-medium">Ajoutez vos premiers patients</p>
                <p className="text-blue-700 text-sm">Commencez à gérer vos dossiers médicaux</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="text-blue-900 font-medium">Planifiez vos rendez-vous</p>
                <p className="text-blue-700 text-sm">Organisez votre planning de consultations</p>
              </div>
            </div>
          </div>
        </div>

                 {/* Action Buttons */}
         <div className="flex flex-col sm:flex-row gap-4 mt-8">
           <button
             onClick={() => router.push('/dashboard')}
             className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
           >
             Aller au tableau de bord
           </button>
           <button
             onClick={() => router.push('/patients')}
             className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
           >
             Gérer les patients
           </button>
         </div>

         {/* Debug Button - Force Update Subscription Status */}
         {cabinet?.isTrialActive && (
           <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                 <div>
                   <p className="text-red-900 font-medium">Problème détecté</p>
                   <p className="text-red-700 text-sm">
                     Le cabinet est encore en essai gratuit malgré le paiement. 
                     Cliquez pour forcer la mise à jour.
                   </p>
                 </div>
               </div>
               <button
                 onClick={async () => {
                   try {
                     const response = await fetch('/api/cabinet/update-subscription', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ planId: plan, isActive: true })
                     })
                     
                     if (response.ok) {
                       // Refetch cabinet data
                       const updatedResponse = await fetch('/api/cabinet')
                       const updatedData = await updatedResponse.json()
                       if (updatedData.cabinet) {
                         setCabinet(updatedData.cabinet)
                         alert('Statut mis à jour avec succès !')
                       }
                     }
                   } catch (error) {
                     console.error('Error updating subscription:', error)
                     alert('Erreur lors de la mise à jour')
                   }
                 }}
                 className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
               >
                 Forcer la mise à jour
               </button>
             </div>
           </div>
         )}

        


      </div>
    </div>
  )
}

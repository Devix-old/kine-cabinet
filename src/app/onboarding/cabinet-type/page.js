'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAvailableCabinetTypes } from '@/lib/cabinet-configs'
import { useCabinetConfig } from '@/hooks/useCabinetConfig'
import { ArrowRight, Check } from 'lucide-react'

export default function CabinetTypeSelection() {
  const [selectedType, setSelectedType] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { refreshCabinetConfig } = useCabinetConfig()
  
  const cabinetTypes = getAvailableCabinetTypes()

  const handleContinue = async () => {
    if (!selectedType) return
    
    setIsLoading(true)
    
    try {
      // Update cabinet type in database
      const response = await fetch('/api/cabinet/update-type', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cabinetType: selectedType
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du type de cabinet')
      }

      // Refresh cabinet config to get the updated type
      refreshCabinetConfig()

      // Proceed to next onboarding step: cabinet name
      setTimeout(() => {
        router.push('/onboarding')
      }, 100)
    } catch (error) {
      console.error('Error updating cabinet type:', error)
      router.push('/onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre type de cabinet
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Sélectionnez le type de cabinet qui correspond le mieux à votre activité. 
            Nous adapterons l'interface et les fonctionnalités en conséquence.
          </p>
        </div>

        {/* Cabinet Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 sm:mb-12">
          {cabinetTypes.map((cabinetType) => (
            <CabinetTypeCard
              key={cabinetType.value}
              cabinetType={cabinetType}
              isSelected={selectedType === cabinetType.value}
              onSelect={() => setSelectedType(cabinetType.value)}
            />
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedType || isLoading}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Chargement...
              </>
            ) : (
              <>
                Continuer vers le dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Vous pourrez modifier ce choix plus tard dans les paramètres de votre cabinet.
          </p>
        </div>
      </div>
    </div>
  )
}

function CabinetTypeCard({ cabinetType, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`relative p-6 bg-white rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'border-blue-500 shadow-lg bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Icon and Title */}
      <div className="flex items-center space-x-4 mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
          isSelected ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {cabinetType.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {cabinetType.displayName}
          </h3>
          <p className="text-sm text-gray-500">
            {cabinetType.name}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4">
        {cabinetType.description}
      </p>

      {/* Features */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Fonctionnalités incluses :</h4>
        <div className="grid grid-cols-1 gap-2">
          {cabinetType.features.map((feature) => (
            <div key={feature.id} className="flex items-center space-x-2">
              <span className="text-sm">{feature.icon}</span>
              <span className="text-sm text-gray-600">{feature.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Color indicator */}
      <div className={`absolute bottom-4 right-4 w-3 h-3 rounded-full bg-${cabinetType.color}-500`}></div>
    </div>
  )
}

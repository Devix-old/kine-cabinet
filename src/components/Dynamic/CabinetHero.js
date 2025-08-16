'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, Play } from 'lucide-react'
import { useCabinetConfig } from '@/hooks/useCabinetConfig'
import Header from '@/components/SaaS/Header'

export default function CabinetHero() {
  const { config, isLoading, refreshCabinetConfig } = useCabinetConfig()
  const [isVisible, setIsVisible] = useState(false)

  // Default hero configuration for unauthenticated users
  const defaultConfig = {
    name: 'Cabinet Médical',
    hero: {
      title: 'Gestion de cabinet médical',
      subtitle: 'Solution complète et moderne',
      description: 'Simplifiez la gestion de votre cabinet avec notre solution complète de prise de rendez-vous, suivi des patients et facturation.',
      cta: 'Commencer gratuitement'
    },
    features: [
      { id: 1, name: 'Gestion patients', icon: '👥' },
      { id: 2, name: 'Rendez-vous', icon: '📅' },
      { id: 3, name: 'Suivi traitements', icon: '📋' }
    ],
    icon: '🏥',
    displayName: 'Cabinet Médical',
    description: 'Gestion complète de votre cabinet'
  }

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Use default config if no config is available (for unauthenticated users)
  const heroConfig = config || defaultConfig

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <Header />
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-blue-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-purple-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-gradient-to-r from-blue-50 to-transparent rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pt-16 sm:pt-20 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 py-8 sm:py-12 lg:py-16 min-h-[calc(100vh-120px)] items-center">
            
            {/* Left Column - Content */}
            <div className={`text-center lg:text-left transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Solution complète pour {heroConfig.name ? heroConfig.name.toLowerCase() : 'votre cabinet'}
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6 px-2 sm:px-0">
                {heroConfig.hero?.title || 'Gestion de cabinet médical'}
                <span className="block text-blue-600 mt-1 sm:mt-2">{heroConfig.hero?.subtitle || 'Solution complète et moderne'}</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 px-2 sm:px-0">
                {heroConfig.hero?.description || 'Simplifiez la gestion de votre cabinet avec notre solution complète de prise de rendez-vous, suivi des patients et facturation.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start px-4 sm:px-0">
                <a
                  href="/auth/register"
                  className="group inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {heroConfig.hero?.cta || 'Commencer gratuitement'}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="/demo"
                  className="group inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Voir la démo
                </a>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0">
                {(heroConfig.features || []).map((feature, index) => (
                  <div
                    key={feature.id}
                    className={`flex items-center justify-center space-x-3 p-2 sm:p-0 transform transition-all duration-700 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                  >
                    <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg sm:text-xl">{feature.icon || '📋'}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{feature.name || 'Fonctionnalité'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className={`relative self-center mt-8 lg:mt-0 transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="relative max-w-md sm:max-w-lg mx-auto lg:max-w-none">
                {/* Main Dashboard Mockup */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 transform rotate-1 sm:rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-1.5 sm:space-x-2 mb-3 sm:mb-4">
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full"></div>
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full"></div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg sm:text-xl">{heroConfig.icon || '🏥'}</span>
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-medium text-gray-900">{heroConfig.displayName || 'Cabinet Médical'}</h3>
                          <p className="text-xs sm:text-sm text-gray-500">{heroConfig.description || 'Gestion complète de votre cabinet'}</p>
                        </div>
                      </div>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-lg sm:text-xl font-bold text-blue-600">150</div>
                        <div className="text-xs text-gray-500">Patients</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-lg sm:text-xl font-bold text-green-600">45</div>
                        <div className="text-xs text-gray-500">RDV</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-lg sm:text-xl font-bold text-purple-600">12</div>
                        <div className="text-xs text-gray-500">Aujourd'hui</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

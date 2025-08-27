'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, Play, CheckCircle, Menu, X, Users, Calendar, BarChart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Header from './Header'

// Loading skeleton component
const HeroSkeleton = () => (
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
          
          {/* Left Column - Content Skeleton */}
          <div className="text-center lg:text-left">
            {/* Badge Skeleton */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-200 animate-pulse mb-4 sm:mb-6">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              <div className="w-32 h-4 bg-gray-300 rounded"></div>
            </div>

            {/* Heading Skeleton */}
            <div className="mb-4 sm:mb-6">
              <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-blue-200 rounded animate-pulse w-3/4"></div>
            </div>

            {/* Description Skeleton */}
            <div className="mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>

            {/* CTA Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start px-4 sm:px-0">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-48"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-32"></div>
            </div>

            {/* Features Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-center space-x-3 p-2 sm:p-0">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Hero Image Skeleton */}
          <div className="relative self-center mt-8 lg:mt-0">
            <div className="relative max-w-md sm:max-w-lg mx-auto lg:max-w-none">
              <div className="bg-gray-200 rounded-xl sm:rounded-2xl h-64 sm:h-80 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const features = [
  { icon: Users, text: 'Gestion patients' },
  { icon: Calendar, text: 'Rendez-vous' },
  { icon: BarChart, text: 'Suivi traitements' }
]

export default function ProfessionalHero() {
  const [isVisible, setIsVisible] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Show loading skeleton while session is loading
  if (status === 'loading') {
    return <HeroSkeleton />
  }

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
                {session?.user ? 'Connecté' : 'Solution complète pour kinésithérapeutes'}
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6 px-2 sm:px-0">
                {session?.user ? (
                  <>
                    Bienvenue dans votre cabinet
                    <span className="block text-blue-600 mt-1 sm:mt-2">{session.user.cabinetName || 'Cabinet'}</span>
                  </>
                ) : (
                  <>
                    Gérez votre cabinet 
                    <span className="block text-blue-600 mt-1 sm:mt-2">en toute simplicité</span>
                  </>
                )}
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 px-2 sm:px-0">
                {session?.user ? (
                  `Accédez à votre tableau de bord pour gérer vos patients, rendez-vous et traitements.`
                ) : (
                  `Optimisez la gestion de vos patients et rendez-vous avec notre solution intuitive 
                  dédiée aux professionnels de la kinésithérapie.`
                )}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start px-4 sm:px-0">
                {session?.user ? (
                  <>
                    <a
                      href="/dashboard"
                      className="group inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      Accéder au tableau de bord
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                      href="/compte"
                      className="group inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                    >
                      Mon compte
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="/auth/register"
                      className="group inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      Essai gratuit 14 jours
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                      href="/demo"
                      className="group inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Voir la démo
                    </a>
                  </>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-center space-x-3 p-2 sm:p-0 transform transition-all duration-700 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                  >
                    <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className={`relative self-center mt-8 lg:mt-0 transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="relative max-w-md sm:max-w-lg mx-auto lg:max-w-none">
                {/* Hero Image */}
                <div className="relative">
                  <img 
                    src="/hero_image.jpg" 
                    alt="Cabinet de kinésithérapie - Interface de gestion" 
                    className="w-full h-auto rounded-xl sm:rounded-2xl shadow-2xl transform rotate-1 sm:rotate-3 hover:rotate-0 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Optional overlay for better text contrast if needed */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                </div>

                {/* Floating Cards for additional context */}
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-white rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-4 transform -rotate-3 sm:-rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">12 RDV</span>
                  </div>
                </div>

                <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-white rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-4 transform rotate-3 sm:rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Users className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">245 patients</span>
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
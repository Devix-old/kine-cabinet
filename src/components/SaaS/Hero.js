'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, Play, CheckCircle, Menu, X, Users, Calendar, BarChart } from 'lucide-react'
import Header from './Header'



const features = [
  { icon: Users, text: 'Gestion patients' },
  { icon: Calendar, text: 'Rendez-vous' },
  { icon: BarChart, text: 'Suivi traitements' }
]


export default function ProfessionalHero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <Header />
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-50 to-transparent rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 py-12 lg:py-16 pt-5">
            
            {/* Left Column - Content */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Solution complète pour kinésithérapeutes
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Gérez votre cabinet 
                <span className="block text-blue-600 mt-2">en toute simplicité</span>
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
                Optimisez la gestion de vos patients et rendez-vous avec notre solution intuitive 
                dédiée aux professionnels de la kinésithérapie.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a
                  href="/auth/register"
                  className="group inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Essai gratuit 14 jours
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="/demo"
                  className="group inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Voir la démo
                </a>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 transform transition-all duration-700 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className={`relative self-center transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="relative">
                {/* Main Dashboard Mockup */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-blue-100 rounded"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-gray-100 rounded"></div>
                      <div className="h-16 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">12 RDV aujourd'hui</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">245 patients</span>
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
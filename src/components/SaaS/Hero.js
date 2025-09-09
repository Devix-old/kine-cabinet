'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, Play, CheckCircle, Menu, X, Users, Calendar, BarChart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Header from './Header'

// Loading skeleton component
const HeroSkeleton = () => (
  <div className="relative min-h-screen bg-gradient-to-br from-[#FBFBFB] to-[#E6F1F7] overflow-hidden font-['Inter',sans-serif]">
    <Header />
    
    {/* Background Elements */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FBFBFB] via-[#F8FBFD] to-[#E6F1F7]" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#4CB5B5]/20 to-[#7BC6B5]/15 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#4CB5B5]/15 to-[#DCEEF5]/20 rounded-full blur-lg animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-[#DCEEF5]/10 to-[#4CB5B5]/15 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
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
    <div className="relative min-h-screen bg-gradient-to-br from-[#FBFBFB] to-[#E6F1F7] overflow-hidden font-['Inter',sans-serif]">
      <Header />
      
      {/* Modern Medical SaaS Animated Background */}
      <div className="absolute inset-0">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FBFBFB] via-[#F8FBFD] to-[#E6F1F7]" />
        
        {/* Softly glowing turquoise circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#4CB5B5]/20 to-[#7BC6B5]/15 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#4CB5B5]/15 to-[#DCEEF5]/20 rounded-full blur-lg animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-[#DCEEF5]/10 to-[#4CB5B5]/15 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        
        {/* Pastel blue floating shapes with continuous motion */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-[#DCEEF5]/30 to-[#4CB5B5]/25 rounded-full blur-md animate-bounce" style={{ animationDuration: '8s', animationDelay: '0s' }} />
        <div className="absolute top-3/4 right-1/3 w-20 h-20 bg-gradient-to-br from-[#7BC6B5]/20 to-[#DCEEF5]/25 rounded-full blur-lg animate-bounce" style={{ animationDuration: '10s', animationDelay: '3s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-gradient-to-br from-[#4CB5B5]/20 to-[#DCEEF5]/15 rounded-full blur-sm animate-bounce" style={{ animationDuration: '12s', animationDelay: '1.5s' }} />
        
        {/* Smooth wave-like curves with medical color palette */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full opacity-8" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z" fill="url(#wave1)" />
            <path d="M0,500 Q300,400 600,500 T1200,500 L1200,800 L0,800 Z" fill="url(#wave2)" />
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4CB5B5" stopOpacity="0.08" />
                <stop offset="50%" stopColor="#7BC6B5" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#DCEEF5" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7BC6B5" stopOpacity="0.06" />
                <stop offset="50%" stopColor="#4CB5B5" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#7BC6B5" stopOpacity="0.06" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Animated grid pattern for depth */}
        <div className="absolute inset-0 opacity-4">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #4CB5B5 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, #7BC6B5 1px, transparent 1px)`,
            backgroundSize: '50px 50px, 30px 30px',
            animation: 'gridMove 20s linear infinite'
          }} />
        </div>
        
        {/* Floating particles with medical colors */}
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-[#4CB5B5]/40 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0s' }} />
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-[#7BC6B5]/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-[#DCEEF5]/50 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        
        {/* Subtle medical-themed elements */}
        <div className="absolute top-1/2 left-10 w-8 h-8 border border-[#4CB5B5]/20 rounded-full animate-spin" style={{ animationDuration: '15s' }} />
        <div className="absolute bottom-1/2 right-10 w-6 h-6 border border-[#7BC6B5]/15 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
      </div>
      
             {/* Custom CSS for advanced animations and image enhancement */}
       <style jsx>{`
         @keyframes gridMove {
           0% { transform: translate(0, 0); }
           100% { transform: translate(50px, 50px); }
         }
         
                   @keyframes float {
            0%, 100% { 
              transform: translateY(0px) scale(1); 
            }
            50% { 
              transform: translateY(-8px) scale(1.02); 
            }
          }
          
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
          
          .hero-image-scale {
            transform: scale(2.5);
          }
          
          @media (min-width: 640px) {
            .hero-image-scale {
              transform: scale(2.8);
            }
          }
          
          @media (min-width: 1024px) {
            .hero-image-scale {
              transform: scale(3.0);
            }
          }
         
         @keyframes glow {
           0%, 100% { opacity: 0.3; transform: scale(1); }
           50% { opacity: 0.6; transform: scale(1.1); }
         }
         
                   /* Enhanced image blending for transparent PNGs */
          .hero-image-enhanced {
            mix-blend-mode: multiply;
            filter: contrast(1.2) brightness(1.08) saturate(1.15) hue-rotate(2deg);
            -webkit-filter: contrast(1.2) brightness(1.08) saturate(1.15) hue-rotate(2deg);
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            isolation: isolate;
            will-change: filter;
          }
          
          /* Advanced transparency masking */
          .hero-image-mask {
            position: relative;
            isolation: isolate;
          }
          
          .hero-image-mask::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, 
              rgba(76, 181, 181, 0.02) 0%, 
              rgba(220, 238, 245, 0.03) 25%, 
              rgba(123, 198, 181, 0.02) 50%, 
              rgba(76, 181, 181, 0.03) 75%, 
              rgba(220, 238, 245, 0.02) 100%);
            border-radius: inherit;
            pointer-events: none;
            z-index: 1;
          }
          
          .hero-image-mask::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, 
              rgba(76, 181, 181, 0.02) 0%, 
              transparent 20%, 
              rgba(123, 198, 181, 0.02) 40%, 
              transparent 60%, 
              rgba(220, 238, 245, 0.02) 80%, 
              transparent 100%);
            border-radius: inherit;
            pointer-events: none;
            z-index: 0;
          }
          
          /* Alternative blend modes for different backgrounds */
          .hero-image-dark {
            mix-blend-mode: screen;
            filter: contrast(1.2) brightness(1.1) saturate(1.2);
          }
          
          .hero-image-light {
            mix-blend-mode: multiply;
            filter: contrast(1.15) brightness(1.02) saturate(1.05);
          }
          
          /* Advanced edge cleanup */
          .hero-image-clean {
            filter: contrast(1.25) brightness(1.1) saturate(1.2) hue-rotate(1deg);
            -webkit-filter: contrast(1.25) brightness(1.1) saturate(1.2) hue-rotate(1deg);
            mix-blend-mode: multiply;
            isolation: isolate;
          }
          
          /* Background artifact removal */
          .hero-image-bg-removal {
            position: relative;
            isolation: isolate;
          }
          
          .hero-image-bg-removal::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at center, 
              rgba(76, 181, 181, 0.03) 0%, 
              rgba(123, 198, 181, 0.02) 30%, 
              rgba(220, 238, 245, 0.01) 60%, 
              transparent 100%);
            border-radius: inherit;
            pointer-events: none;
            z-index: 1;
            mix-blend-mode: soft-light;
          }
       `}</style>

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pt-16 sm:pt-20 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 py-8 sm:py-12 lg:py-16 min-h-[calc(100vh-120px)] items-center">
            
            {/* Left Column - Content */}
            <div className={`text-center lg:text-left transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                           {/* Badge */}
               <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#DCEEF5]/30 border border-[#4CB5B5]/20 text-[#2F4A5C] text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                 <span className="w-2 h-2 bg-[#4CB5B5] rounded-full mr-2"></span>
                 {session?.user ? 'Connecté' : 'Solution complète pour kinésithérapeutes'}
               </div>

               {/* Main Heading */}
               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2F4A5C] leading-tight mb-4 sm:mb-6 px-2 sm:px-0">
                 {session?.user ? (
                   <>
                     Bienvenue dans votre cabinet
                     <span className="block text-[#4CB5B5] mt-1 sm:mt-2">{session.user.cabinetName || 'Cabinet'}</span>
                   </>
                 ) : (
                   <>
                     Gérez votre cabinet 
                     <span className="block text-[#4CB5B5] mt-1 sm:mt-2">en toute simplicité</span>
                   </>
                 )}
               </h1>

               {/* Description */}
               <p className="text-base sm:text-lg text-[#3A5166] leading-relaxed mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 px-2 sm:px-0">
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
                       className="group inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg bg-[#4CB5B5] text-white font-semibold hover:bg-[#3DA4A4] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                     >
                       Accéder au tableau de bord
                       <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                     </a>
                     <a
                       href="/compte"
                       className="group inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg border border-[#4CB5B5]/30 text-[#2F4A5C] font-semibold hover:bg-[#DCEEF5]/20 transition-all duration-300 text-sm sm:text-base"
                     >
                       Mon compte
                     </a>
                   </>
                 ) : (
                   <>
                     <a
                       href="/auth/register"
                       className="group inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg bg-[#4CB5B5] text-white font-semibold hover:bg-[#3DA4A4] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                     >
                       Essai gratuit 7 jours
                       <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                     </a>
                     <a
                       href="/demo"
                       className="group inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg border border-[#4CB5B5]/30 text-[#2F4A5C] font-semibold hover:bg-[#DCEEF5]/20 transition-all duration-300 text-sm sm:text-base"
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
                     <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 bg-[#DCEEF5]/50 rounded-lg flex items-center justify-center">
                       <feature.icon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#4CB5B5]" />
                     </div>
                     <span className="text-xs sm:text-sm font-medium text-[#3A5166]">{feature.text}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className={`relative self-center mt-8 lg:mt-0 transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="relative max-w-lg sm:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto lg:max-w-none">
                                 {/* Hero Image with Advanced Transparency Masking */}
                 <div className="relative hero-image-mask hero-image-bg-removal">
                                       <img 
                      src="/hero_image_transparent.png" 
                      alt="Cabinet de kinésithérapie - Interface de gestion" 
                      className="hero-image-enhanced hero-image-clean hero-image-scale w-full h-auto rounded-xl sm:rounded-2xl relative z-10 animate-float"
                      style={{ 
                        transform: 'scale(2.5)',
                        transformOrigin: 'center center'
                      }}
                      loading="lazy"
                    />
                   
                   {/* Radial gradient mask for edge cleanup */}
                   <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none z-20"
                        style={{
                          background: `radial-gradient(ellipse at center, rgba(76, 181, 181, 0.02) 0%, transparent 60%)`
                        }}></div>
                   
                   {/* Subtle pattern overlay for texture matching */}
                   <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-20 pointer-events-none z-20"
                        style={{
                          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(76, 181, 181, 0.005) 3px, rgba(76, 181, 181, 0.005) 6px)`
                        }}>
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
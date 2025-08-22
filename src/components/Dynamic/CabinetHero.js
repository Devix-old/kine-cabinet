'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, Users, Calendar, BarChart, TrendingUp, Shield, Home, Menu, X } from 'lucide-react'

// Consistent and modern data for the component
const navItems = [
  { name: 'Accueil', href: '#', icon: Home },
  { name: 'Fonctionnalités', href: '#features' },
  { name: 'Tarifs', href: '#pricing' },
  { name: 'Contact', href: '#contact' },
]

const features = [
  { icon: Users, text: 'Gestion Patients' },
  { icon: Calendar, text: 'Rendez-vous' },
  { icon: BarChart, text: 'Suivi Traitements' },
]

const stats = [
  { number: '2,500+', label: 'Professionnels', icon: Users },
  { number: '150k+', label: 'Patients suivis', icon: TrendingUp },
  { number: '99.9%', label: 'Disponibilité', icon: Shield },
]

// Main Component
export default function ModernHero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Configuration object for easy text changes
  const config = {
    displayName: 'KinéPro',
    hero: {
      title: 'Optimisez votre',
      subtitle: 'cabinet médical',
      description: 'La plateforme tout-en-un pour kinésithérapeutes. Gagnez du temps, améliorez les soins et gérez vos patients sans effort.',
      ctaPrimary: 'Démarrer gratuitement',
      ctaSecondary: 'Voir la démo',
    },
  }
  
  // Effect for tracking mouse movement for background parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 50,
        y: (e.clientY / window.innerHeight - 0.5) * 50,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  // Component for the background orbs
  const BackgroundOrbs = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl"
        style={{ top: '5%', left: '10%' }}
        animate={{
          x: mousePosition.x * 0.2,
          y: mousePosition.y * 0.2,
          rotate: 20,
          scale: 1.1,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] bg-indigo-200/25 rounded-full blur-3xl"
        style={{ top: '50%', right: '10%' }}
        animate={{
          x: -mousePosition.x * 0.3,
          y: -mousePosition.y * 0.3,
          rotate: -20,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] bg-blue-100/20 rounded-full blur-3xl"
        style={{ bottom: '5%', left: '25%' }}
        animate={{
            x: mousePosition.x * 0.1,
            y: mousePosition.y * 0.1,
            scale: 1.2,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.2 }}
      />
    </div>
  )

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      <BackgroundOrbs />
      <div className="relative z-10 h-full flex flex-col">
        {/* Navigation */}
        <header className="w-full px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {config.displayName}
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center space-x-4">
              <a href="/auth/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Connexion
              </a>
              <a href="/auth/register" className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Essai gratuit
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-200/50 transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileMenuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </header>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden absolute top-20 left-4 right-4 bg-white/80 backdrop-blur-lg rounded-xl border shadow-xl"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <a key={item.name} href={item.href} className="block text-gray-800 font-medium p-2 rounded-md hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 mt-4 space-y-3 border-t">
                   <a href="/auth/login" className="block text-center py-2.5 text-gray-800 font-medium rounded-lg hover:bg-gray-100">Connexion</a>
                   <a href="/auth/register" className="block text-center py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg">Essai gratuit</a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

                 {/* Hero Content */}
         <main className="flex-1 flex items-center">
           <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
             <motion.div 
               className="w-full grid lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center"
               variants={containerVariants}
               initial="hidden"
               animate="visible"
             >
                             {/* Left Column - Content */}
               <div className="lg:col-span-6 space-y-6 lg:space-y-8 text-center lg:text-left">
                 <motion.div variants={itemVariants} className="space-y-4">
                   <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight">
                     <span className="text-gray-800">{config.hero.title}</span>
                     <br />
                     <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                       {config.hero.subtitle}
                     </span>
                   </h1>
                   <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto lg:mx-0" />
                 </motion.div>

                 <motion.p variants={itemVariants} className="text-lg lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
                   {config.hero.description}
                 </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="/auth/register" className="group flex items-center justify-center px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-indigo-300">
                    {config.hero.ctaPrimary}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="/demo" className="group flex items-center justify-center px-7 py-3.5 border border-gray-300 rounded-xl font-semibold text-gray-700 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
                    <Play className="w-5 h-5 mr-2 text-blue-600" />
                    {config.hero.ctaSecondary}
                  </a>
                </motion.div>
                
                                 <motion.div variants={itemVariants} className="flex justify-center lg:justify-start space-x-8 lg:space-x-12 pt-6">
                   {stats.slice(0, 3).map((stat) => (
                     <div key={stat.label} className="text-center">
                        <p className="text-2xl lg:text-3xl font-bold text-gray-800">{stat.number}</p>
                        <p className="text-sm lg:text-base text-gray-500">{stat.label}</p>
                     </div>
                   ))}
                 </motion.div>
              </div>

                             {/* Right Column - Advanced Visual */}
               <motion.div variants={itemVariants} className="lg:col-span-6">
                 <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
                     <motion.div 
                         className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-white/40 shadow-2xl"
                         initial={{ scale: 0.95, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                     >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex space-x-1.5">
                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            </div>
                            <p className="text-sm font-medium text-gray-600">{config.displayName} Dashboard</p>
                        </div>

                                                 <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 lg:p-6 border border-blue-100/50 space-y-3">
                            <div className="flex justify-between items-center">
                               <h3 className="font-semibold text-gray-800 lg:text-lg">Activité Hebdomadaire</h3>
                               <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500" />
                            </div>
                            <ProgressBar label="Nouveaux Patients" value={85} color="from-blue-500 to-cyan-400" />
                            <ProgressBar label="Rendez-vous" value={67} color="from-indigo-500 to-purple-400" />
                            <ProgressBar label="Traitements Terminés" value={92} color="from-emerald-500 to-green-400" />
                         </div>

                         <div className="grid grid-cols-3 gap-3 lg:gap-4 mt-4 lg:mt-6">
                             {features.map((feature, index) => (
                                 <div key={index} className="bg-white/80 rounded-lg p-3 lg:p-4 text-center border border-white/30 shadow-sm">
                                     <feature.icon className="w-6 h-6 lg:w-7 lg:h-7 mx-auto text-blue-600 mb-1 lg:mb-2" />
                                     <p className="text-xs lg:text-sm font-medium text-gray-700">{feature.text}</p>
                                 </div>
                             ))}
                         </div>
                    </motion.div>
                    
                                         {/* Floating Cards */}
                     <FloatingCard icon={Calendar} title="24" subtitle="RDV aujourd'hui" position="-top-8 -right-8 lg:-top-10 lg:-right-10" rotate={6} />
                     <FloatingCard icon={Users} title="1,247" subtitle="Patients Actifs" position="-bottom-8 -left-8 lg:-bottom-10 lg:-left-10" rotate={-6} />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Helper component for progress bars in the UI demo
const ProgressBar = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-600">{label}</span>
            <span className="text-xs font-bold text-gray-700">{value}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div 
                className={`h-1.5 rounded-full bg-gradient-to-r ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, delay: 0.8, ease: 'easeInOut' }}
            />
        </div>
    </div>
);

 // Helper component for floating cards in the UI demo
 const FloatingCard = ({ icon: Icon, title, subtitle, position, rotate }) => (
     <motion.div 
         className={`absolute ${position} bg-white/90 backdrop-blur-lg rounded-xl p-3 lg:p-4 shadow-xl border border-white/50`}
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ opacity: 1, scale: 1, rotate: rotate }}
         transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 1 }}
         whileHover={{ scale: 1.1, rotate: rotate + 5, zIndex: 50 }}
     >
         <div className="flex items-center space-x-2 lg:space-x-3">
             <div className="p-2 lg:p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                 <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
             </div>
             <div>
                 <p className="font-bold text-gray-800 lg:text-lg">{title}</p>
                 <p className="text-xs lg:text-sm text-gray-500">{subtitle}</p>
             </div>
         </div>
     </motion.div>
 )
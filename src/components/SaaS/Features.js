"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Activity, 
  BarChart3, 
  CreditCard, 
  FileText, 
  Shield, 
  Smartphone, 
  Headphones 
} from 'lucide-react';

const Features = () => {
  // Hero Features Data
  const heroFeatures = [
    {
      id: 1,
      title: "Gestion Patients",
      description: "Suivez vos patients avec des dossiers médicaux complets et sécurisés. Interface intuitive pour une gestion optimale des informations patient.",
      color: "blue",
      mockImage: "patients"
    },
    {
      id: 2,
      title: "Rendez-vous",
      description: "Planifiez et gérez vos rendez-vous avec un système de réservation intelligent. Synchronisation automatique et notifications en temps réel.",
      color: "purple",
      mockImage: "calendar"
    },
    {
      id: 3,
      title: "Suivi Traitements",
      description: "Surveillez l'évolution des traitements et l'efficacité des soins. Analytics avancés pour un suivi personnalisé de chaque patient.",
      color: "green",
      mockImage: "treatment"
    }
  ];

  // Enhanced Other Features Data with icons
  const otherFeatures = [
    { 
      id: 1, 
      title: "Analytics", 
      description: "Tableaux de bord détaillés et insights business",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500"
    },
    { 
      id: 2, 
      title: "Facturation", 
      description: "Gestion automatique des paiements et factures",
      icon: CreditCard,
      color: "from-green-500 to-emerald-500"
    },
    { 
      id: 3, 
      title: "Rapports", 
      description: "Génération automatique de documents médicaux",
      icon: FileText,
      color: "from-purple-500 to-violet-500"
    },
    { 
      id: 4, 
      title: "Sécurité", 
      description: "Protection avancée des données patients",
      icon: Shield,
      color: "from-red-500 to-orange-500"
    },
    { 
      id: 5, 
      title: "Mobile", 
      description: "Accès depuis tous vos appareils mobiles",
      icon: Smartphone,
      color: "from-indigo-500 to-purple-500"
    },
    { 
      id: 6, 
      title: "Support", 
      description: "Assistance technique 24/7 et formation",
      icon: Headphones,
      color: "from-pink-500 to-rose-500"
    }
  ];

  // Mock Image Components
  const PatientsMockImage = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 p-6">
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 8px rgba(59, 130, 246, 0)", "0 0 0 0 rgba(59, 130, 246, 0)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Users className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>
            <div>
              <motion.div 
                className="h-3 bg-gray-300 rounded w-20 mb-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="h-2 bg-gray-200 rounded w-16"
                animate={{ scaleX: [0.8, 1, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <motion.div 
              className="h-2 bg-blue-200 rounded w-full"
              animate={{ scaleX: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="h-2 bg-blue-100 rounded w-3/4"
              animate={{ scaleX: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <motion.div 
              key={i} 
              className="bg-white/80 rounded-lg p-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <motion.div 
                className="w-6 h-6 bg-blue-400 rounded mb-2"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
              />
              <motion.div 
                className="h-2 bg-gray-200 rounded mb-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
              <div className="h-1 bg-gray-100 rounded"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const CalendarMockImage = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-50 via-white to-purple-100 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 p-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <motion.div 
              className="h-4 bg-purple-500 rounded w-20"
              animate={{ scaleX: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Calendar className="w-5 h-5 text-purple-500" />
            </motion.div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-3">
            {Array.from({length: 7}).map((_, i) => (
              <motion.div 
                key={i} 
                className="h-6 bg-gray-100 rounded text-xs flex items-center justify-center text-gray-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              >
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length: 21}).map((_, i) => (
              <motion.div 
                key={i} 
                className={`h-6 rounded text-xs flex items-center justify-center ${
                  [3, 7, 11, 15].includes(i) 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-50 text-gray-400'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
              >
                {i + 1}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const TreatmentMockImage = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-green-50 via-white to-green-100 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 p-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Activity className="w-5 h-5 text-green-500" />
            </motion.div>
            <motion.div 
              className="h-3 bg-green-500 rounded w-24"
              animate={{ scaleX: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="space-y-3">
            {[85, 70, 95, 60].map((width, i) => (
              <motion.div 
                key={i} 
                className="space-y-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              >
                <div className="flex justify-between items-center">
                  <motion.div 
                    className="h-2 bg-gray-300 rounded w-16"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                  <motion.div 
                    className="text-xs text-gray-500"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                  >
                    {width}%
                  </motion.div>
                </div>
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const getMockImage = (type) => {
    switch(type) {
      case 'patients':
        return <PatientsMockImage />;
      case 'calendar':
        return <CalendarMockImage />;
      case 'treatment':
        return <TreatmentMockImage />;
      default:
        return <PatientsMockImage />;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const otherContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const otherItemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="features" className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20 lg:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6"
          >
            Fonctionnalités
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6"
          >
            Outils Essentiels pour
            <br />
            Votre Cabinet
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Découvrez les fonctionnalités avancées qui transformeront la gestion
            de votre cabinet de kinésithérapie
          </motion.p>
        </div>

        {/* Hero Features - Alternating Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-20 lg:space-y-32 mb-20 lg:mb-32"
        >
          {heroFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-12 lg:gap-20`}
            >
              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className={`inline-block px-3 py-1 bg-${feature.color}-100 text-${feature.color}-700 rounded-full text-sm font-medium mb-6`}
                >
                  0{feature.id}
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className={`text-3xl lg:text-4xl xl:text-5xl font-bold text-${feature.color}-600 mb-6`}
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl"
                >
                  {feature.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="mt-8"
                >
                  <button className={`px-8 py-4 bg-${feature.color}-500 hover:bg-${feature.color}-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                    En savoir plus
                  </button>
                </motion.div>
              </div>

              {/* Image */}
              <div className="flex-1 max-w-lg">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: index % 2 === 0 ? 30 : -30 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  whileHover={{ scale: 1.02, rotateY: 5 }}
                  className="relative aspect-[4/3] w-full"
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
                  <div className="relative w-full h-full shadow-2xl rounded-2xl overflow-hidden">
                    {getMockImage(feature.mockImage)}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Other Features - Enhanced Grid */}
        <motion.div
          variants={otherContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative"
        >
          <div className="text-center mb-16">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
            >
              Plus de Fonctionnalités
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-600 text-lg"
            >
              Tout ce dont vous avez besoin pour exceller
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  variants={otherItemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative"
                >
                  <div className="relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    {/* Background Gradient */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`}></div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
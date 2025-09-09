'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle, User, ArrowRight, Star, Shield, Clock, Users } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const resp = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          cabinetType: 'KINESITHERAPIE',
          trialDays: 7,
          maxPatients: 3
        })
      })

      const data = await resp.json()
      if (!resp.ok) {
        throw new Error(data?.error || 'Inscription impossible')
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: '/onboarding'
      })

      if (result?.error) {
        throw new Error('Compte créé, mais la connexion a échoué. Veuillez vous connecter manuellement.')
      }

      window.location.href = '/onboarding'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.acceptTerms &&
      formData.password === formData.confirmPassword &&
      formData.password.length >= 8
    )
  }

  const trialFeatures = [
    { icon: Clock, text: '7 jours' },
    { icon: Users, text: '3 patients' },
    { icon: Shield, text: 'Sécurisé' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBFBFB] to-[#E6F1F7] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#4CB5B5]/10 to-[#7BC6B5]/8 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#4CB5B5]/8 to-[#DCEEF5]/12 rounded-full blur-lg animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-[#DCEEF5]/6 to-[#4CB5B5]/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <div className="mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-[#DCEEF5]/30 border border-[#4CB5B5]/20 text-[#2F4A5C] text-sm font-medium rounded-full mb-8">
                <span className="w-2 h-2 bg-[#4CB5B5] rounded-full mr-2"></span>
                7 jours d'essai gratuit
              </div>
              
              <h1 className="text-4xl xl:text-5xl font-bold bg-gradient-to-r from-[#2F4A5C] via-[#4CB5B5] to-[#2F4A5C] bg-clip-text text-transparent mb-6 leading-tight">
                Créez votre cabinet en minutes
              </h1>
              
              <p className="text-xl text-[#3A5166] leading-relaxed mb-8">
                Aucune carte de crédit requise.
              </p>
            </div>

            {/* Trial Features */}
            <div className="flex space-x-8">
              {trialFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4] rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[#3A5166] font-medium text-sm">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-[#DCEEF5]/30 border border-[#4CB5B5]/20 text-[#2F4A5C] text-sm font-medium rounded-full mb-4">
                <span className="w-2 h-2 bg-[#4CB5B5] rounded-full mr-2"></span>
                KineCabinet
              </div>
            </div>

            {/* Register Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#DCEEF5] p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#2F4A5C] mb-2">
                  Créez votre compte
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Email */}
                <div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#DCEEF5] rounded-xl focus:ring-2 focus:ring-[#4CB5B5] focus:border-[#4CB5B5] transition-all duration-300 bg-white/50"
                    placeholder="Adresse email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-[#DCEEF5] rounded-xl focus:ring-2 focus:ring-[#4CB5B5] focus:border-[#4CB5B5] transition-all duration-300 bg-white/50"
                    placeholder="Mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#3A5166] hover:text-[#4CB5B5] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-[#DCEEF5] rounded-xl focus:ring-2 focus:ring-[#4CB5B5] focus:border-[#4CB5B5] transition-all duration-300 bg-white/50"
                    placeholder="Confirmer le mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#3A5166] hover:text-[#4CB5B5] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Terms */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#4CB5B5] focus:ring-[#4CB5B5] border-[#DCEEF5] rounded mt-1"
                    required
                  />
                  <label htmlFor="acceptTerms" className="ml-3 block text-sm text-[#3A5166]">
                    En vous inscrivant, vous acceptez nos{' '}
                    <Link href="/terms" className="text-[#4CB5B5] hover:text-[#3DA4A4] font-medium">
                      Conditions
                    </Link>{' '}
                    et{' '}
                    <Link href="/privacy" className="text-[#4CB5B5] hover:text-[#3DA4A4] font-medium">
                      Politique de confidentialité
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#4CB5B5] to-[#3DA4A4] hover:shadow-lg hover:shadow-[#4CB5B5]/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      Commencer l'essai gratuit
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-[#3A5166]">
                  Déjà un compte ?{' '}
                  <Link 
                    href="/auth/login" 
                    className="font-semibold text-[#4CB5B5] hover:text-[#3DA4A4] transition-colors"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 
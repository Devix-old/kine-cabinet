'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToastContext } from '@/contexts/ToastContext'
import { Eye, EyeOff, Loader2, LogIn, ArrowRight, Shield, Zap, Users } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { error: showError } = useToastContext()
  const { data: session, status } = useSession()

  // Rediriger si déjà connecté
  useEffect(() => {
    if (status === 'authenticated') {
      window.location.href = '/dashboard'
    }
  }, [status])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      })

      if (result?.error) {
        showError('Email ou mot de passe incorrect')
      } else {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      showError('Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Users, text: 'Gestion patients' },
    { icon: Shield, text: 'Sécurisé RGPD' },
    { icon: Zap, text: 'Interface moderne' }
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
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-[#DCEEF5]/30 border border-[#4CB5B5]/20 text-[#2F4A5C] text-sm font-medium rounded-full mb-6">
                <span className="w-2 h-2 bg-[#4CB5B5] rounded-full mr-2"></span>
                Solution professionnelle
              </div>
              
              <h1 className="text-4xl xl:text-5xl font-bold bg-gradient-to-r from-[#2F4A5C] via-[#4CB5B5] to-[#2F4A5C] bg-clip-text text-transparent mb-6 leading-tight">
                Gérez votre cabinet de kinésithérapie
              </h1>
              
              <p className="text-xl text-[#3A5166] leading-relaxed mb-8">
                La solution complète pour optimiser la gestion de vos patients, 
                rendez-vous et traitements avec une interface moderne et intuitive.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4] rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[#3A5166] font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
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

            {/* Login Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#DCEEF5] p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#2F4A5C] mb-2">
                  Connexion
                </h2>
                <p className="text-[#3A5166]">
                  Accédez à votre espace professionnel
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#3A5166] mb-3">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[#DCEEF5] rounded-xl focus:ring-2 focus:ring-[#4CB5B5] focus:border-[#4CB5B5] transition-all duration-300 bg-white/50 text-[#2F4A5C] placeholder-[#3A5166]"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#3A5166] mb-3">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-[#DCEEF5] rounded-xl focus:ring-2 focus:ring-[#4CB5B5] focus:border-[#4CB5B5] transition-all duration-300 bg-white/50 text-[#2F4A5C] placeholder-[#3A5166]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#3A5166] hover:text-[#4CB5B5] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#4CB5B5] to-[#3DA4A4] hover:shadow-lg hover:shadow-[#4CB5B5]/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-[#3A5166]">
                  Pas encore de compte ?{' '}
                  <Link 
                    href="/auth/register" 
                    className="font-semibold text-[#4CB5B5] hover:text-[#3DA4A4] transition-colors"
                  >
                    Créer un compte
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
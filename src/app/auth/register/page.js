'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle, User, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    clinicName: '',
    phone: '',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const inputWithIconClass = 'w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

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
      // 1) Create cabinet + admin via public API
      const resp = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          clinicName: formData.clinicName,
          phone: formData.phone,
        })
      })

      const data = await resp.json()
      if (!resp.ok) {
        throw new Error(data?.error || 'Inscription impossible')
      }

      // 2) Auto sign-in the new admin
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        throw new Error('Compte créé, mais la connexion a échoué. Veuillez vous connecter manuellement.')
      }

      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.clinicName &&
      formData.phone &&
      formData.acceptTerms &&
      formData.password === formData.confirmPassword &&
      formData.password.length >= 8
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Créer un compte</h2>
          <p className="mt-2 text-gray-600">Commencez votre essai gratuit de 14 jours</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                <input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleInputChange} className={inputClass} placeholder="Votre prénom" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleInputChange} className={inputClass} placeholder="Votre nom" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Adresse email *</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="vous@example.com" />
            </div>

            {/* Clinic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700 mb-2">Nom du cabinet *</label>
                <input id="clinicName" name="clinicName" type="text" required value={formData.clinicName} onChange={handleInputChange} className={inputClass} placeholder="Nom de votre cabinet" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="06 12 34 56 78" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleInputChange} className={inputWithIconClass} placeholder="••••••••" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (<EyeOff className="h-5 w-5" />) : (<Eye className="h-5 w-5" />)}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
              <div className="relative">
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleInputChange} className={inputWithIconClass} placeholder="••••••••" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (<EyeOff className="h-5 w-5" />) : (<Eye className="h-5 w-5" />)}
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            {/* Terms */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="acceptTerms" name="acceptTerms" type="checkbox" required checked={formData.acceptTerms} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" className="text-gray-700">
                  J'accepte les{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">conditions d'utilisation</Link>{' '}et la{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">politique de confidentialité</Link>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={!isFormValid() || loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
              {loading ? (<><Loader2 className="h-5 w-5 mr-2 animate-spin" />Création en cours...</>) : ('Créer mon compte')}
            </button>

            {/* Already have account */}
            <div className="pt-2 text-center text-sm">
              <span className="text-gray-600">Déjà un compte ? </span>
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">Se connecter</Link>
            </div>
          </form>
        </div>

        {/* Benefits */}
        <div className="p-4 bg-white/60 backdrop-blur rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Votre essai gratuit inclut :</h3>
          <ul className="space-y-2">
            <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /><span className="text-sm text-gray-700">14 jours d'essai gratuit</span></li>
            <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /><span className="text-sm text-gray-700">Toutes les fonctionnalités</span></li>
            <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /><span className="text-sm text-gray-700">Support technique inclus</span></li>
            <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /><span className="text-sm text-gray-700">Annulation à tout moment</span></li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
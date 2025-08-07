'use client'

import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { memo } from 'react'

const ProtectedRoute = memo(function ProtectedRoute({ 
  children, 
  requiredRole = null,
  requiredAction = null,
  fallback = null 
}) {
  const { isAuthenticated, isLoading, hasRole, canPerform } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    )
  }

  // Vérifier le rôle requis
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Accès non autorisé</p>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires</p>
        </div>
      </div>
    )
  }

  // Vérifier l'action requise
  if (requiredAction && !canPerform(requiredAction.resource, requiredAction.action)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Action non autorisée</p>
          <p className="text-gray-600">Vous n'avez pas les permissions pour cette action</p>
        </div>
      </div>
    )
  }

  return children
})

export default ProtectedRoute 
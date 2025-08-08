import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { canAccessPage, canPerformAction } from '@/lib/utils'
import { useMemo, useCallback } from 'react'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  const user = session?.user

  // Forcer le refresh de la session à chaque changement de page
  const refreshSession = useCallback(async () => {
    if (isAuthenticated) {
      await update()
    }
  }, [isAuthenticated, update])

  // Vérifier les permissions
  const canAccess = useMemo(() => {
    if (!user) return false
    return canAccessPage(user.role, pathname)
  }, [user, pathname])

  const canPerform = useCallback((resource, action) => {
    if (!user) return false
    return canPerformAction(user.role, resource, action)
  }, [user])

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useCallback((requiredRole) => {
    if (!user) return false
    return user.role === requiredRole
  }, [user])

  // Logout avec nettoyage complet
  const logout = useCallback(async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: '/auth/login'
    })
    // Forcer le refresh de la page
    window.location.href = '/auth/login'
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    canAccess,
    canPerform,
    hasRole,
    logout,
    refreshSession
  }
}
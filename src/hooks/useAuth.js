import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { canAccessPage, canPerformAction } from '@/lib/utils'
import { useMemo, useCallback } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  const user = session?.user

  // Memoize role permissions to avoid recalculating on every render
  const rolePermissions = useMemo(() => ({
    ADMIN: ['/', '/rendez-vous', '/patients', '/dossiers', '/traitements', '/statistiques', '/parametres', '/utilisateurs'],
    KINE: ['/', '/rendez-vous', '/patients', '/dossiers', '/traitements', '/statistiques'],
    SECRETAIRE: ['/', '/rendez-vous', '/patients', '/dossiers']
  }), [])

  const hasRole = useCallback((role) => {
    return user?.role === role
  }, [user?.role])

  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role)
  }, [user?.role])

  const isAdmin = useCallback(() => hasRole('ADMIN'), [hasRole])
  const isKine = useCallback(() => hasRole('KINE'), [hasRole])
  const isSecretaire = useCallback(() => hasRole('SECRETAIRE'), [hasRole])

  // Memoize canAccess function
  const canAccess = useCallback((page) => {
    if (!user?.role) return false
    
    const allowedPages = rolePermissions[user.role] || []
    return allowedPages.includes(page)
  }, [user?.role, rolePermissions])

  const canPerform = useCallback((resource, action) => {
    return canPerformAction(user?.role, resource, action)
  }, [user?.role])

  const requirePageAccess = useCallback((page, callback) => {
    if (!requireAuth()) return false
    
    if (!canAccess(page)) {
      router.push('/')
      return false
    }
    
    return callback ? callback() : true
  }, [canAccess, router])

  const requireAction = useCallback((resource, action, callback) => {
    if (!requireAuth()) return false
    
    if (!canPerform(resource, action)) {
      router.push('/')
      return false
    }
    
    return callback ? callback() : true
  }, [canPerform, router])

  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }, [router])

  const requireAuth = useCallback((callback) => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login')
      return false
    }
    return callback ? callback() : true
  }, [isAuthenticated, isLoading, router])

  const requireRole = useCallback((role, callback) => {
    if (!requireAuth()) return false
    
    if (!hasRole(role)) {
      router.push('/')
      return false
    }
    
    return callback ? callback() : true
  }, [hasRole, requireAuth, router])

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    isAdmin,
    isKine,
    isSecretaire,
    canAccess,
    canPerform,
    requirePageAccess,
    requireAction,
    logout,
    requireAuth,
    requireRole
  }
}
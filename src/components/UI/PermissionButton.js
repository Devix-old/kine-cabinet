'use client'

import { useAuth } from '@/hooks/useAuth'

export default function PermissionButton({
  children,
  action,
  resource,
  fallback = null,
  className = '',
  ...props
}) {
  const { canPerform } = useAuth()

  // Vérifier les permissions
  const hasPermission = action && resource ? canPerform(resource, action) : true

  if (!hasPermission) {
    return fallback
  }

  return (
    <button className={className} {...props}>
      {children}
    </button>
  )
} 
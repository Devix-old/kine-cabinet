'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }) {
  return (
    <SessionProvider 
      refetchInterval={0} // Désactiver le refetch automatique
      refetchOnWindowFocus={false} // Désactiver le refetch au focus
      refetchWhenOffline={false} // Désactiver le refetch hors ligne
    >
      {children}
    </SessionProvider>
  )
} 
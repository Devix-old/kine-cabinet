import './globals.css'
import { ToastProvider } from '@/contexts/ToastContext'
import { Providers } from './providers'
// import PerformanceMonitor from '@/components/UI/PerformanceMonitor' // Temporairement désactivé

export const metadata = {
  title: 'Cabinet de Kinésithérapie',
  description: 'Application de gestion pour cabinet de kinésithérapie',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        <Providers>
          <ToastProvider>
            {children}
            {/* <PerformanceMonitor /> */} {/* Temporairement désactivé */}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}

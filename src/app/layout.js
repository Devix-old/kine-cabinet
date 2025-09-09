import './globals.css'
import '../styles/inputs.css'
import { ToastProvider } from '@/contexts/ToastContext'
import { Providers } from './providers'
import { CabinetConfigProvider } from '@/hooks/useCabinetConfig'
// import PerformanceMonitor from '@/components/UI/PerformanceMonitor' // Temporairement désactivé

export const metadata = {
  title: 'Cabinet de Santé - Gestion Universelle',
  description: 'Application de gestion universelle pour tous types de cabinets de santé',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        <Providers>
          <CabinetConfigProvider>
            <ToastProvider>
              {children}
              {/* <PerformanceMonitor /> */} {/* Temporairement désactivé */}
            </ToastProvider>
          </CabinetConfigProvider>
        </Providers>
      </body>
    </html>
  )
}

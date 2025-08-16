'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCabinetConfig, useEnabledModules } from '@/hooks/useCabinetConfig'
import { 
  Home, 
  Users, 
  Calendar, 
  Activity, 
  FileText, 
  CreditCard, 
  BarChart, 
  Settings,
  UserCog,
  LogOut
} from 'lucide-react'

const menuItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home, 
    always: true 
  },
  { 
    name: 'Patients', 
    href: '/patients', 
    icon: Users, 
    moduleKey: 'patients' 
  },
  { 
    name: 'Rendez-vous', 
    href: '/rendez-vous', 
    icon: Calendar, 
    moduleKey: 'appointments' 
  },
  { 
    name: 'Traitements', 
    href: '/traitements', 
    icon: Activity, 
    moduleKey: 'treatments' 
  },
  { 
    name: 'Dossiers', 
    href: '/dossiers', 
    icon: FileText, 
    moduleKey: 'medicalRecords' 
  },
  { 
    name: 'Facturation', 
    href: '/billing', 
    icon: CreditCard, 
    moduleKey: 'billing' 
  },
  { 
    name: 'Statistiques', 
    href: '/statistiques', 
    icon: BarChart, 
    moduleKey: 'statistics' 
  },
  { 
    name: 'Utilisateurs', 
    href: '/utilisateurs', 
    icon: UserCog, 
    moduleKey: 'users' 
  },
  { 
    name: 'Paramètres', 
    href: '/parametres', 
    icon: Settings, 
    moduleKey: 'settings' 
  }
]

export default function DynamicSidebar() {
  const pathname = usePathname()
  const { config, isLoading, refreshCabinetConfig } = useCabinetConfig()
  const enabledModules = useEnabledModules()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Filter menu items based on enabled modules
  const filteredMenuItems = menuItems.filter(item => 
    item.always || (item.moduleKey && enabledModules.includes(item.moduleKey))
  )

  // Show loading state while config is loading
  if (isLoading || !config) {
    return (
      <div className="bg-white shadow-lg w-64">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Chargement...</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">{config.icon || '🏥'}</span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 truncate">
                  {config.displayName || 'Cabinet Médical'}
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  {config.name || 'Cabinet'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && (
              <span className="text-sm">Déconnexion</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}


import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCabinetConfig, useEnabledModules } from '@/hooks/useCabinetConfig'
import StaticEniripsaLogo from '@/components/UI/StaticEniripsaLogo'
import { 
  Home, 
  Users, 
  Calendar, 
  Activity, 
  FileText, 
  Settings, 
  BarChart3, 
  User, 
  LogOut,
  Menu,
  X,
  FlaskConical,
  CreditCard
} from 'lucide-react'

const menuItems = [
  { 
    name: 'Tableau de bord', 
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
    icon: BarChart3, 
    moduleKey: 'statistics' 
  },
  { 
    name: 'Utilisateurs', 
    href: '/utilisateurs', 
    icon: User, 
    moduleKey: 'users' 
  },
  { 
    name: 'Paramètres', 
    href: '/parametres', 
    icon: Settings, 
    moduleKey: 'settings' 
  }
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, canAccess } = useAuth()
  const { config, isLoading } = useCabinetConfig()
  const enabledModules = useEnabledModules()

  const handleLogout = async () => {
    await logout()
    // Le logout force déjà le refresh
  }

  // Filter menu items based on enabled modules and user permissions
  const filteredNavigation = useMemo(() => {
    if (!user?.role || !config) return [] // Return empty if no config
    
    const filteredByModules = menuItems.filter(item => 
      item.always || (item.moduleKey && enabledModules.includes(item.moduleKey))
    )
    
    // Apply role-based filtering
    return filteredByModules.filter(item => {
      switch (item.href) {
        case '/dashboard':
          return ['ADMIN', 'KINE', 'SECRETAIRE'].includes(user.role)
        case '/patients':
          return ['ADMIN', 'KINE', 'SECRETAIRE'].includes(user.role)
        case '/rendez-vous':
          return ['ADMIN', 'KINE', 'SECRETAIRE'].includes(user.role)
        case '/dossiers':
          return ['ADMIN', 'KINE', 'SECRETAIRE'].includes(user.role)
        case '/traitements':
          return ['ADMIN', 'KINE'].includes(user.role)
        case '/statistiques':
          return ['ADMIN', 'KINE'].includes(user.role)
        case '/utilisateurs':
          return ['ADMIN'].includes(user.role)
        case '/parametres':
          return ['ADMIN'].includes(user.role)
        default:
          return true
      }
    })
  }, [user?.role, enabledModules, config]) // Added config to dependencies

  const isActive = (href) => pathname === href

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-lg"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <StaticEniripsaLogo className="w-12 h-12" showText={false} />
              <div className="text-left">
                <h1 className="text-lg font-bold text-teal-700 leading-tight">
                  Eniripsa
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  {config?.name || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Rôle'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Se déconnecter"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
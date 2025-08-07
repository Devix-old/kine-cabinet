'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Activity, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut,
  User,
  UserCog
} from 'lucide-react'

const navigation = [
  { name: 'Accueil', href: '/', icon: Home, roles: ['ADMIN', 'KINE', 'SECRETAIRE'] },
  { name: 'Rendez-vous', href: '/rendez-vous', icon: Calendar, roles: ['ADMIN', 'KINE', 'SECRETAIRE'] },
  { name: 'Patients', href: '/patients', icon: Users, roles: ['ADMIN', 'KINE', 'SECRETAIRE'] },
  { name: 'Dossiers Médicaux', href: '/dossiers', icon: FileText, roles: ['ADMIN', 'KINE', 'SECRETAIRE'] },
  { name: 'Suivi Traitements', href: '/traitements', icon: Activity, roles: ['ADMIN', 'KINE'] },
  { name: 'Statistiques', href: '/statistiques', icon: BarChart3, roles: ['ADMIN', 'KINE'] },
  { name: 'Utilisateurs', href: '/utilisateurs', icon: UserCog, roles: ['ADMIN'] },
  { name: 'Paramètres', href: '/parametres', icon: Settings, roles: ['ADMIN'] },
]

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, canAccess } = useAuth()

  // Memoize filtered navigation to prevent recalculation on every render
  const filteredNavigation = useMemo(() => {
    if (!user?.role) return []
    
    const rolePermissions = {
      ADMIN: ['/', '/rendez-vous', '/patients', '/dossiers', '/traitements', '/statistiques', '/parametres', '/utilisateurs'],
      KINE: ['/', '/rendez-vous', '/patients', '/dossiers', '/traitements', '/statistiques'],
      SECRETAIRE: ['/', '/rendez-vous', '/patients', '/dossiers']
    }
    
    const allowedPages = rolePermissions[user.role] || []
    
    return navigation.filter(item => allowedPages.includes(item.href))
  }, [user?.role])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="bg-white p-2 rounded-md shadow-md"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-center h-16 bg-blue-600 text-white">
          <h1 className="text-xl font-bold">Cabinet Kiné</h1>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.nom || 'Utilisateur'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() || 'Rôle'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart3, 
  User, 
  LogOut,
  Menu,
  X,
  FlaskConical
} from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, canAccess } = useAuth()

  const handleLogout = async () => {
    await logout()
    // Le logout force déjà le refresh
  }

  // Navigation avec permissions
  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: Home, roles: ['ADMIN', 'KINE', 'SECRETAIRE'] },
    { name: 'Patients', href: '/patients', icon: Users, roles: ['ADMIN', 'KINE', 'SECRETAIRE'] },
    { name: 'Rendez-vous', href: '/rendez-vous', icon: Calendar, roles: ['ADMIN', 'KINE', 'SECRETAIRE'] },
    { name: 'Dossiers', href: '/dossiers', icon: FileText, roles: ['ADMIN', 'KINE', 'SECRETAIRE'] },
    { name: 'Traitements', href: '/traitements', icon: FlaskConical, roles: ['ADMIN', 'KINE'] },
    { name: 'Statistiques', href: '/statistiques', icon: BarChart3, roles: ['ADMIN', 'KINE'] },
    { name: 'Utilisateurs', href: '/utilisateurs', icon: User, roles: ['ADMIN'] },
    { name: 'Paramètres', href: '/parametres', icon: Settings, roles: ['ADMIN'] },
  ]

  // Filtrer la navigation selon les permissions
  const filteredNavigation = useMemo(() => {
    if (!user?.role) return []
    return navigation.filter(item => item.roles.includes(user.role))
  }, [user?.role])

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
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Kine Cabinet</h1>
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
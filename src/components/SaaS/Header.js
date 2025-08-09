'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, ChevronDown } from 'lucide-react'

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Fonctionnalités', href: '/features' },
  { name: 'Tarifs', href: '/pricing' },
  { name: 'À propos', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  const userInitials = useMemo(() => {
    const name = session?.user?.name || ''
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  }, [session?.user?.name])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    await signOut({ redirect: false, callbackUrl: '/' })
    window.location.href = '/'
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-xl shadow-sm' 
        : 'bg-transparent'
    }`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5 group">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">KineCabinet</span>
            </div>
          </a>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Ouvrir le menu principal"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 relative">
          {!session?.user ? (
            <>
              <a
                href="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2"
              >
                Se connecter
              </a>
              <a
                href="/auth/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all duration-300"
              >
                Commencer l’essai gratuit
              </a>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <span className="text-sm font-semibold">{userInitials}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg ring-1 ring-black/5 py-1 z-50">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b">Connecté</div>
                  <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Tableau de bord</a>
                  <a href="/parametres" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Paramètres</a>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Se déconnecter</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm shadow-xl">
            <div className="flex items-center justify-between">
              <a href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">K</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">KineCabinet</span>
                </div>
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-8 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-6 space-y-3">
                {!session?.user ? (
                  <>
                    <a
                      href="/auth/login"
                      className="block rounded-lg px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </a>
                    <a
                      href="/auth/register"
                      className="block rounded-lg bg-blue-600 px-3 py-3 text-center text-base font-semibold text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Commencer
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/dashboard" className="block rounded-lg px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      Tableau de bord
                    </a>
                    <a href="/parametres" className="block rounded-lg px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      Paramètres
                    </a>
                    <button onClick={async () => { await handleLogout(); setMobileMenuOpen(false) }} className="w-full text-left rounded-lg px-3 py-3 text-base font-medium text-red-600 hover:bg-gray-50">
                      Se déconnecter
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const pathname = req.nextUrl.pathname

    const isApiRoute = pathname.startsWith('/api')
    const isApiAuthRoute = pathname.startsWith('/api/auth')
    const isApiPublicRoute = pathname.startsWith('/api/public') || pathname.startsWith('/api/placeholder')

    // Protect API routes except auth and explicitly public ones
    if (isApiRoute && !isApiAuthRoute && !isApiPublicRoute && !isAuth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const isApiAuthRoute = pathname.startsWith('/api/auth')
        const isApiPublicRoute = pathname.startsWith('/api/public') || pathname.startsWith('/api/placeholder')

        // Always allow auth and explicitly public API routes
        if (isApiAuthRoute || isApiPublicRoute) {
          return true
        }

        // Require auth for matched routes (see matcher below)
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    // Protect only application sections and APIs. Marketing pages (/, /about, /pricing, /features, /contact, etc.) remain public.
    '/dashboard/:path*',
    '/patients/:path*',
    '/rendez-vous/:path*',
    '/dossiers/:path*',
    '/traitements/:path*',
    '/statistiques/:path*',
    '/utilisateurs/:path*',
    '/parametres/:path*',
    '/admin/:path*',

    // APIs except those explicitly handled as public in the middleware above
    '/api/:path*',
  ]
} 
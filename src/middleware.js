import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isApiRoute = req.nextUrl.pathname.startsWith('/api')

    // Protection des routes API (sauf auth)
    if (isApiRoute && !req.nextUrl.pathname.startsWith('/api/auth') && !isAuth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
        const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')
        
        // Autoriser les pages d'auth et les API d'auth
        if (isAuthPage || isApiAuthRoute) {
          return true
        }
        
        // Exiger l'authentification pour tout le reste
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'
  ]
} 
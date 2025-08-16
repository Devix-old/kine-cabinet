import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const pathname = req.nextUrl.pathname
    const isOnboardingRoute = pathname.startsWith('/onboarding')

    const isApiRoute = pathname.startsWith('/api')
    const isApiAuthRoute = pathname.startsWith('/api/auth')
    const isApiPublicRoute = pathname.startsWith('/api/public') || pathname.startsWith('/api/placeholder')
    const isWebhookRoute = pathname.startsWith('/api/payments/webhook')

    // Protect API routes except auth, webhooks, and explicitly public ones
    if (isApiRoute && !isApiAuthRoute && !isApiPublicRoute && !isWebhookRoute && !isAuth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Enforce onboarding completion for app routes (non-API) when authenticated
    if (!isApiRoute && isAuth) {
      const onboardingCookie = req.cookies.get('onboardingCompleted')?.value
      const onboardingDoneFromCookie = onboardingCookie === 'true'
      const onboardingDoneFromToken = token?.cabinetOnboardingCompleted === true

      if (!isOnboardingRoute && !(onboardingDoneFromCookie || onboardingDoneFromToken)) {
        const url = req.nextUrl.clone()
        url.pathname = '/onboarding'
        url.search = ''
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const isApiAuthRoute = pathname.startsWith('/api/auth')
        const isApiPublicRoute = pathname.startsWith('/api/public') || pathname.startsWith('/api/placeholder')
        const isWebhookRoute = pathname.startsWith('/api/payments/webhook')

        // Always allow auth, webhooks, and explicitly public API routes
        if (isApiAuthRoute || isApiPublicRoute || isWebhookRoute) {
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
    '/onboarding/:path*',

    // APIs except those explicitly handled as public in the middleware above
    '/api/:path*',
  ]
} 
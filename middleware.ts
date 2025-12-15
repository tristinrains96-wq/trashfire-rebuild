import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Protected routes that require authentication
const protectedRoutes = ['/workspace', '/dashboard', '/settings']

// Protected API routes (generation endpoints)
const protectedApiRoutes = [
  '/api/outline',
  '/api/pipeline',
  '/api/episodes',
]

const isProtectedRoute = createRouteMatcher(protectedRoutes)
const isProtectedApiRoute = createRouteMatcher(protectedApiRoutes)

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl

  // Protect page routes
  if (isProtectedRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/login', request.url)
      signInUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Protect API routes (generation endpoints)
  if (isProtectedApiRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*))',
  ],
}


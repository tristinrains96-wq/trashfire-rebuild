import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Check if Clerk is configured
const CLERK_ENABLED = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...' &&
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== 'sk_test_...'
)

// Protected routes that require authentication
const protectedRoutes = ['/workspace', '/dashboard', '/settings']

// Protected API routes (generation endpoints)
const protectedApiRoutes = [
  '/api/outline',
  '/api/pipeline',
  '/api/episodes',
]

let clerkMiddleware: any
let createRouteMatcher: any
let isProtectedRoute: any
let isProtectedApiRoute: any

if (CLERK_ENABLED) {
  try {
    const clerk = require('@clerk/nextjs/server')
    clerkMiddleware = clerk.clerkMiddleware
    createRouteMatcher = clerk.createRouteMatcher
    isProtectedRoute = createRouteMatcher(protectedRoutes)
    isProtectedApiRoute = createRouteMatcher(protectedApiRoutes)
  } catch (error) {
    console.warn('[Middleware] Clerk not available, auth disabled:', error)
  }
}

// Fallback middleware if Clerk not configured
function fallbackMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow all routes in dev mode without Clerk
  if (process.env.NODE_ENV === 'development' && !CLERK_ENABLED) {
    return NextResponse.next()
  }
  
  // In production without Clerk, still allow but log warning
  if (!CLERK_ENABLED) {
    console.warn('[Middleware] Clerk not configured, allowing request to:', pathname)
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export default CLERK_ENABLED && clerkMiddleware
  ? clerkMiddleware(async (auth: any, request: NextRequest) => {
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
  : fallbackMiddleware

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


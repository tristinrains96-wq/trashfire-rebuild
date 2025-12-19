import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Check if Clerk is configured
const CLERK_ENABLED = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...' &&
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== 'sk_test_...'
)

// Conditionally import Clerk functions
let clerkMiddleware: any
let createRouteMatcher: any
let isPublicRoute: any
let isProtectedRoute: any
let isProtectedApiRoute: any

if (CLERK_ENABLED) {
  try {
    const clerk = require('@clerk/nextjs/server')
    clerkMiddleware = clerk.clerkMiddleware
    createRouteMatcher = clerk.createRouteMatcher
    
    // Public routes that don't require authentication
    isPublicRoute = createRouteMatcher([
      '/',
      '/sign-in(.*)',
      '/sign-up(.*)',
      '/login', // Keep for backward compatibility
      '/setup',
      '/api/setup/status',
      '/api/health',
      '/api/healthz',
    ])

    // Protected routes that require authentication
    isProtectedRoute = createRouteMatcher([
      '/workspace(.*)',
      '/dashboard(.*)',
      '/settings(.*)',
      '/auth-doctor(.*)',
    ])

    // Protected API routes (generation endpoints)
    isProtectedApiRoute = createRouteMatcher([
      '/api/outline(.*)',
      '/api/pipeline(.*)',
      '/api/episodes(.*)',
    ])
  } catch (error) {
    console.warn('[Middleware] Clerk not available, auth disabled:', error)
  }
}

// Fallback middleware if Clerk not configured
function fallbackMiddleware(request: NextRequest) {
  return NextResponse.next()
}

// Main middleware
export default CLERK_ENABLED && clerkMiddleware
  ? clerkMiddleware(async (auth: any, request: NextRequest) => {
      const { pathname } = request.nextUrl

      // Allow public routes
      if (isPublicRoute(request)) {
        return NextResponse.next()
      }

      // Protect page routes
      if (isProtectedRoute(request)) {
        const { userId } = await auth()
        if (!userId) {
          const signInUrl = new URL('/sign-in', request.url)
          signInUrl.searchParams.set('redirect_url', pathname)
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
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - _next/webpack (webpack chunks)
    // - favicon.ico (favicon file)
    // - files with extensions (images, etc.)
    // - Clerk internal routes (already handled by Clerk middleware)
    '/((?!_next/static|_next/image|_next/webpack|favicon.ico|.*\\..*).*)',
    // Match API routes (Clerk middleware will handle its own routes)
    '/api/(.*)',
  ],
}

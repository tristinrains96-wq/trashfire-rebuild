/**
 * Middleware for Public UI Demo Branch
 * NO REAL AUTHENTICATION - FOR DEMO ONLY
 * All routes are accessible (demo mode)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Demo mode: all routes are accessible
export default function middleware(request: NextRequest) {
  return NextResponse.next()
}

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

import { NextResponse } from 'next/server'

/**
 * Health check endpoint for Public UI Demo Branch
 * NO REAL SERVICES - FOR DEMO ONLY
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    services: ['web'],
    mode: 'demo',
    note: 'This is a UI-only demo branch. All backend services are disabled.'
  })
}

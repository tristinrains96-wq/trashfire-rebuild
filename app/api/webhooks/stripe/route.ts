/**
 * Stripe Webhook Handler
 * Handles subscription events for billing
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/lib/billing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    const event = JSON.parse(body)
    const result = await handleStripeWebhook(event, signature)

    if (result.success) {
      return NextResponse.json({ received: true })
    } else {
      return NextResponse.json(
        { error: result.message || 'Webhook processing failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}


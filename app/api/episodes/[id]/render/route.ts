/**
 * Episode Render API
 * POST /api/episodes/[id]/render
 * Queues full pipeline: SVD video + ElevenLabs audio + FFmpeg stitch
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkRateLimit } from '@/lib/auth'
import { checkCredits, deductCredits } from '@/lib/billing'
import { queueRenderJob } from '@/jobs/queue'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Rate limiting: 10 jobs/min per user
    const rateLimit = await checkRateLimit(user.id, 10, 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      )
    }

    const episodeId = params.id
    const body = await request.json()
    const { scenes, quality = 'LOW' } = body

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: scenes array required' },
        { status: 400 }
      )
    }

    // Estimate duration (5 min per scene average)
    const estimatedMinutes = scenes.length * 5

    // Check credits before queueing
    const creditCheck = await checkCredits(user.id, estimatedMinutes)
    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          reason: creditCheck.reason,
          remaining: creditCheck.remaining,
        },
        { status: 402 } // Payment Required
      )
    }

    // Queue render job
    const job = await queueRenderJob(episodeId, user.id, {
      scenes,
      quality,
    })

    return NextResponse.json({
      jobId: job.id,
      episodeId,
      status: 'queued',
      estimatedMinutes,
      message: 'Render job queued successfully',
    })
  } catch (error: any) {
    console.error('[Render API] Error:', error)
    
    if (error.message === 'Unauthorized: Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to queue render job', details: error.message },
      { status: 500 }
    )
  }
}


/**
 * Episode Status API
 * GET /api/episodes/[id]/status
 * Returns queue position and progress
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getJobStatus } from '@/jobs/queue'

export async function GET(
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

    const episodeId = params.id
    const jobId = request.nextUrl.searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter required' },
        { status: 400 }
      )
    }

    const status = await getJobStatus(jobId)

    if (!status) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Verify job belongs to user
    if (status.data.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Job does not belong to user' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      episodeId,
      jobId,
      state: status.state,
      progress: status.progress,
      result: status.result,
      data: {
        quality: status.data.config?.quality,
        sceneCount: status.data.config?.scenes?.length || 0,
      },
    })
  } catch (error: any) {
    console.error('[Status API] Error:', error)

    if (error.message === 'Unauthorized: Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get job status', details: error.message },
      { status: 500 }
    )
  }
}


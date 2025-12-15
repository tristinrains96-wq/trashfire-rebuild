/**
 * Progress Bar Component
 * Real-time polling of episode render status
 */

'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

interface ProgressBarProps {
  episodeId: string
  jobId: string
  onComplete?: (result: any) => void
  onError?: (error: any) => void
}

type JobState = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed'

export default function ProgressBar({
  episodeId,
  jobId,
  onComplete,
  onError,
}: ProgressBarProps) {
  const [status, setStatus] = useState<{
    state: JobState
    progress: number
    result?: any
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return

    // Poll status every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/episodes/${episodeId}/status?jobId=${jobId}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch status')
        }

        const data = await response.json()
        setStatus({
          state: data.state as JobState,
          progress: typeof data.progress === 'number' ? data.progress : 0,
          result: data.result,
        })

        // Handle completion
        if (data.state === 'completed' && data.result && onComplete) {
          clearInterval(interval)
          onComplete(data.result)
        }

        // Handle failure
        if (data.state === 'failed' && onError) {
          clearInterval(interval)
          onError(new Error('Render job failed'))
        }
      } catch (err: any) {
        setError(err.message)
        if (onError) {
          clearInterval(interval)
          onError(err)
        }
      }
    }, 2000) // Poll every 2 seconds

    // Initial fetch
    fetch(`/api/episodes/${episodeId}/status?jobId=${jobId}`)
      .then(res => res.json())
      .then(data => {
        setStatus({
          state: data.state as JobState,
          progress: typeof data.progress === 'number' ? data.progress : 0,
          result: data.result,
        })
      })
      .catch(err => setError(err.message))

    return () => clearInterval(interval)
  }, [episodeId, jobId, onComplete, onError])

  if (error) {
    return (
      <Card className="bg-[#0a0f15] border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card className="bg-[#0a0f15] border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStateIcon = () => {
    switch (status.state) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-[#00ffea]" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-[#00ffea]" />
    }
  }

  const getStateLabel = () => {
    switch (status.state) {
      case 'waiting':
        return 'Queued'
      case 'active':
        return 'Rendering'
      case 'completed':
        return 'Complete'
      case 'failed':
        return 'Failed'
      case 'delayed':
        return 'Delayed'
      default:
        return 'Processing'
    }
  }

  return (
    <Card className="bg-[#0a0f15] border-white/10">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStateIcon()}
            <span className="text-sm font-medium text-white">
              {getStateLabel()}
            </span>
          </div>
          {status.progress > 0 && (
            <span className="text-xs text-white/60">
              {Math.round(status.progress)}%
            </span>
          )}
        </div>
        {status.state !== 'completed' && status.state !== 'failed' && (
          <Progress
            value={status.progress || 0}
            className="h-2 bg-white/5"
          />
        )}
        {status.state === 'completed' && status.result?.videoUrl && (
          <div className="text-xs text-[#00ffea]">
            Video ready: <a href={status.result.videoUrl} className="underline">View</a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


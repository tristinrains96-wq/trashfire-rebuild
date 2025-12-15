/**
 * Pod Management Job
 * Handles Vast.ai/RunPod pod lifecycle: spin up, idle detection, shutdown
 */

import { spinVastPod, spinRunPodPod, shutdownPod, checkPodStatus } from '@/lib/pod-manager'

export interface PodJobData {
  action: 'spin-up' | 'check-idle' | 'shutdown'
  podId?: string
  provider?: 'vast' | 'runpod'
}

export async function podManagementJob(data: PodJobData) {
  const { action, podId, provider } = data

  switch (action) {
    case 'spin-up': {
      const isDev = process.env.NODE_ENV === 'development'
      const newPodId = isDev
        ? await spinVastPod()
        : await spinRunPodPod()
      return { podId: newPodId }
    }

    case 'check-idle': {
      if (!podId) throw new Error('podId required for check-idle')
      const status = await checkPodStatus(podId, provider || 'runpod')
      
      // Auto-shutdown after 5 min idle
      const idleThreshold = 5 * 60 * 1000 // 5 minutes
      const lastActivity = status.lastActivity ? new Date(status.lastActivity).getTime() : 0
      const now = Date.now()
      const idleTime = now - lastActivity

      if (idleTime > idleThreshold && status.status === 'idle') {
        await shutdownPod(podId, provider)
        return { podId, action: 'auto-shutdown', reason: 'idle-timeout' }
      }

      return { podId, status, idleTime }
    }

    case 'shutdown': {
      if (!podId) throw new Error('podId required for shutdown')
      await shutdownPod(podId, provider)
      return { podId, action: 'shutdown' }
    }

    default:
      throw new Error(`Unknown pod action: ${action}`)
  }
}


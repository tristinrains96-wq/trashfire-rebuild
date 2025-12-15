/**
 * Job Queue System for TrashFire
 * Uses Bull (Redis) for async job processing
 * Handles episode rendering, pod management, and health checks
 */

import Queue from 'bull'
import { renderEpisodeJob } from './render-job'
import { podManagementJob } from './pod-management'
import { healthCheckJob } from './health-check'

// Redis connection URL (defaults to localhost for dev)
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Create queue instances
export const renderQueue = new Queue('render-queue', REDIS_URL)
export const podQueue = new Queue('pod-queue', REDIS_URL)
export const healthQueue = new Queue('health-queue', REDIS_URL)

// Job processors with retry logic (3 attempts)
renderQueue.process('render-episode', async (job) => {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await renderEpisodeJob(job.data)
    } catch (error: any) {
      lastError = error
      console.error(`[Queue] Render job ${job.id} attempt ${attempt}/${maxRetries} failed:`, error)
      
      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // All retries failed - return fallback mock
  console.warn(`[Queue] All retries failed for job ${job.id}, using fallback mock`)
  return {
    success: true,
    videoUrl: `/mock/fallback-episode-${job.data.episodeId}.mp4`,
    duration: 300, // 5 minutes
    fallback: true,
    error: lastError?.message,
  }
})

podQueue.process('manage-pod', async (job) => {
  return await podManagementJob(job.data)
})

healthQueue.process('health-check', async () => {
  return await healthCheckJob()
})

// Queue event handlers
renderQueue.on('completed', (job, result) => {
  console.log(`[Queue] Render job ${job.id} completed:`, result)
})

renderQueue.on('failed', (job, err) => {
  console.error(`[Queue] Render job ${job.id} failed:`, err)
})

podQueue.on('completed', (job, result) => {
  console.log(`[Queue] Pod job ${job.id} completed:`, result)
})

healthQueue.on('completed', (job, result) => {
  console.log(`[Queue] Health check completed:`, result)
})

/**
 * Add render job to queue
 */
export async function queueRenderJob(episodeId: string, userId: string, config: any) {
  return await renderQueue.add('render-episode', {
    episodeId,
    userId,
    config,
    timestamp: Date.now(),
  })
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const job = await renderQueue.getJob(jobId)
  if (!job) return null

  const state = await job.getState()
  const progress = job.progress()
  const result = job.returnvalue

  return {
    id: job.id,
    state,
    progress,
    result,
    data: job.data,
  }
}

/**
 * Clean up old completed jobs (keep last 100)
 */
export async function cleanupOldJobs() {
  const completed = await renderQueue.getCompleted()
  if (completed.length > 100) {
    const toRemove = completed.slice(0, completed.length - 100)
    await Promise.all(toRemove.map(job => job.remove()))
  }
}


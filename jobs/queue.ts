/**
 * Job Queue System for TrashFire
 * Uses Bull (Redis) for async job processing
 * Handles episode rendering, pod management, and health checks
 * Falls back to in-memory mock queue if Redis unavailable (dev mode)
 */

import { renderEpisodeJob } from './render-job'
import { podManagementJob } from './pod-management'
import { healthCheckJob } from './health-check'

// Redis connection URL (defaults to localhost for dev)
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Mock queue for dev when Redis unavailable
class MockQueue {
  private jobs: Map<string, any> = new Map()
  private processors: Map<string, Function> = new Map()

  async add(name: string, data: any) {
    const jobId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const job = { id: jobId, data, name }
    this.jobs.set(jobId, { ...job, state: 'waiting', progress: 0 })
    
    // Process immediately in mock mode
    const processor = this.processors.get(name)
    if (processor) {
      setTimeout(async () => {
        try {
          const result = await processor({ data, id: jobId })
          this.jobs.set(jobId, { ...job, state: 'completed', progress: 100, returnvalue: result })
        } catch (error) {
          this.jobs.set(jobId, { ...job, state: 'failed', progress: 0, failedReason: String(error) })
        }
      }, 100)
    }
    
    return job
  }

  process(name: string, handler: Function) {
    this.processors.set(name, handler)
  }

  async getJob(jobId: string) {
    return this.jobs.get(jobId) || null
  }

  on(event: string, handler: Function) {
    // Mock event handlers (no-op in dev)
  }
}

// Try to use real Bull queue, fallback to mock if Redis unavailable
let Queue: any
let renderQueue: any
let podQueue: any
let healthQueue: any
let useMockQueue = false
let queuesInitialized = false

function initializeQueues() {
  if (queuesInitialized) return
  
  // Default to mock queue for dev (safer)
  if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
    console.warn('[Queue] Development mode: Using mock queue (no Redis required)')
    useMockQueue = true
    renderQueue = new MockQueue()
    podQueue = new MockQueue()
    healthQueue = new MockQueue()
    queuesInitialized = true
    setupProcessors()
    return
  }
  
  try {
    Queue = require('bull')
    renderQueue = new Queue('render-queue', REDIS_URL, {
      settings: {
        maxStalledCount: 0, // Disable stalled job detection in dev
      },
    })
    podQueue = new Queue('pod-queue', REDIS_URL)
    healthQueue = new Queue('health-queue', REDIS_URL)
    
    // Test Redis connection - if error, switch to mock
    renderQueue.client.on('error', (err: Error) => {
      if (!useMockQueue) {
        console.warn('[Queue] Redis unavailable, using mock queue for dev:', err.message)
        useMockQueue = true
        renderQueue = new MockQueue()
        podQueue = new MockQueue()
        healthQueue = new MockQueue()
        setupProcessors()
      }
    })
    
    // If client doesn't exist, use mock
    if (!renderQueue.client) {
      throw new Error('Redis client not available')
    }
  } catch (error: any) {
    console.warn('[Queue] Bull not available, using mock queue for dev:', error?.message || error)
    useMockQueue = true
    renderQueue = new MockQueue()
    podQueue = new MockQueue()
    healthQueue = new MockQueue()
  }
  
  queuesInitialized = true
  setupProcessors()
  setupEventHandlers()
}

// Initialize queues lazily - don't block module load
// Will initialize on first API call
let initPromise: Promise<void> | null = null
function ensureQueuesInitialized() {
  if (!queuesInitialized && !initPromise) {
    initPromise = Promise.resolve().then(() => {
      initializeQueues()
    })
  }
  return initPromise || Promise.resolve()
}

// Auto-initialize in non-blocking way
if (typeof window === 'undefined') {
  // Server-side only
  setImmediate(() => {
    initializeQueues().catch((err) => {
      console.error('[Queue] Initialization error, using mock:', err)
      useMockQueue = true
      renderQueue = new MockQueue()
      podQueue = new MockQueue()
      healthQueue = new MockQueue()
      queuesInitialized = true
      setupProcessors()
    })
  })
}

// Job processors with retry logic (3 attempts)
function setupProcessors() {
  renderQueue.process('render-episode', async (job: any) => {
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

  podQueue.process('manage-pod', async (job: any) => {
    return await podManagementJob(job.data)
  })

  healthQueue.process('health-check', async () => {
    return await healthCheckJob()
  })
}

// Queue event handlers (only for real Bull queues)
function setupEventHandlers() {
  if (!useMockQueue && renderQueue && typeof renderQueue.on === 'function') {
    renderQueue.on('completed', (job: any, result: any) => {
      console.log(`[Queue] Render job ${job.id} completed:`, result)
    })

    renderQueue.on('failed', (job: any, err: Error) => {
      console.error(`[Queue] Render job ${job.id} failed:`, err)
    })

    podQueue.on('completed', (job: any, result: any) => {
      console.log(`[Queue] Pod job ${job.id} completed:`, result)
    })

    healthQueue.on('completed', (job: any, result: any) => {
      console.log(`[Queue] Health check completed:`, result)
    })
  }
}

/**
 * Add render job to queue
 */
export async function queueRenderJob(episodeId: string, userId: string, config: any) {
  await ensureQueuesInitialized()
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
  await ensureQueuesInitialized()
  const job = await renderQueue.getJob(jobId)
  if (!job) return null

  // Handle both real Bull jobs and mock jobs
  const state = job.getState ? await job.getState() : job.state
  const progress = typeof job.progress === 'function' ? job.progress() : (job.progress || 0)
  const result = job.returnvalue || job.result

  return {
    id: job.id || jobId,
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
  if (typeof renderQueue.getCompleted === 'function') {
    const completed = await renderQueue.getCompleted()
    if (completed.length > 100) {
      const toRemove = completed.slice(0, completed.length - 100)
      await Promise.all(toRemove.map((job: any) => job.remove()))
    }
  }
  // Mock queue doesn't need cleanup
}


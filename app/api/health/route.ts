/**
 * Comprehensive Health Check Endpoint
 * Pings all services: Groq, ElevenLabs, RunPod, Redis
 */

import { NextResponse } from 'next/server'
import { groqPing } from '@/lib/utils'
import { elevenLabsPing } from '@/lib/audio_engine'
import { videoEnginePing } from '@/lib/video_engine'
import { checkPodStatus } from '@/lib/pod-manager'

export async function GET() {
  const services: Record<string, { status: string; latency?: number; error?: string }> = {}
  const startTime = Date.now()

  // Check Groq
  try {
    const groqStart = Date.now()
    const groqStatus = await groqPing()
    services.groq = {
      status: groqStatus ? 'online' : 'offline',
      latency: Date.now() - groqStart,
    }
  } catch (error: any) {
    services.groq = {
      status: 'error',
      error: error.message,
    }
  }

  // Check ElevenLabs
  try {
    const elevenStart = Date.now()
    const elevenStatus = await elevenLabsPing()
    services.elevenlabs = {
      status: elevenStatus ? 'online' : 'offline',
      latency: Date.now() - elevenStart,
    }
  } catch (error: any) {
    services.elevenlabs = {
      status: 'error',
      error: error.message,
    }
  }

  // Check Video Engine
  try {
    const videoStart = Date.now()
    const videoStatus = await videoEnginePing()
    services.video = {
      status: videoStatus ? 'online' : 'offline',
      latency: Date.now() - videoStart,
    }
  } catch (error: any) {
    services.video = {
      status: 'error',
      error: error.message,
    }
  }

  // Check Redis (queue system)
  try {
    const redisStart = Date.now()
    const redis = require('redis')
    const client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    })
    await client.connect()
    await client.ping()
    await client.quit()
    services.redis = {
      status: 'online',
      latency: Date.now() - redisStart,
    }
  } catch (error: any) {
    services.redis = {
      status: 'offline',
      error: error.message,
    }
  }

  // Check RunPod (if API key available)
  if (process.env.RUNPOD_API_KEY && process.env.RUNPOD_API_KEY !== 'your_key_here') {
    try {
      const runpodStart = Date.now()
      // Simple API check
      const response = await fetch('https://api.runpod.io/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ __typename }',
        }),
      })
      services.runpod = {
        status: response.ok ? 'online' : 'offline',
        latency: Date.now() - runpodStart,
      }
    } catch (error: any) {
      services.runpod = {
        status: 'error',
        error: error.message,
      }
    }
  } else {
    services.runpod = {
      status: 'not_configured',
    }
  }

  const totalLatency = Date.now() - startTime
  const allHealthy = Object.values(services).every(s => s.status === 'online' || s.status === 'not_configured')

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    latency: totalLatency,
    services,
  })
}


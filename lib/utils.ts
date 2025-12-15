import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Quality presets for generation optimization
 * Balances cost vs. quality for affordable production
 */
export const QUALITY_PRESETS = {
  LOW: {
    name: 'Low (Local)',
    resolution: { width: 1280, height: 720 },
    fps: 24,
    infrastructure: 'local',
    costPerEpisode: 0.50,
    description: '720p @ 24fps, local rendering, fastest, most affordable',
    useRunPod: false,
  },
  HIGH: {
    name: 'High (RunPod)',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    infrastructure: 'runpod',
    costPerEpisode: 1.50,
    description: '1080p @ 30fps, RunPod GPU, professional quality',
    useRunPod: true,
  },
} as const

export type QualityPreset = keyof typeof QUALITY_PRESETS

/**
 * Get quality preset configuration
 */
export function getQualityPreset(preset: QualityPreset) {
  return QUALITY_PRESETS[preset]
}

/**
 * Check if preset requires RunPod (HIGH quality)
 */
export function requiresRunPod(preset: QualityPreset): boolean {
  return QUALITY_PRESETS[preset].useRunPod
}

/**
 * Groq LLM API wrapper
 * Replaces Ollama for cloud-based script generation
 */
export async function groqChat(
  prompt: string,
  context?: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    // Stub mode: return mock response for development
    return `[Groq Stub] Response to: ${prompt.substring(0, 50)}...`
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          ...(context ? [{ role: 'system', content: context }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response from Groq'
  } catch (error) {
    console.error('Groq API error:', error)
    throw error
  }
}

/**
 * Groq health check ping
 * Returns true if API is accessible
 */
export async function groqPing(): Promise<boolean> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    return false // Stub mode: not configured
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
    return response.ok
  } catch (error) {
    console.error('Groq ping error:', error)
    return false
  }
}

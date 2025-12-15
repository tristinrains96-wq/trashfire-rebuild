/**
 * Audio Engine for TrashFire
 * ElevenLabs Turbo SDK wrapper for dialogue synthesis
 * Uses Turbo voices at $0.15-0.20/min effective rates (2025 Starter/Creator)
 */

export interface AudioSynthesisOptions {
  voiceId: string
  model?: 'eleven_turbo_v2' | 'eleven_multilingual_v2'
  stability?: number
  similarityBoost?: number
  style?: number
  useSpeakerBoost?: boolean
}

export interface AudioResult {
  audioUrl: string
  durationSeconds: number
  characterCount: number
  cost: number
}

/**
 * Synthesize dialogue using ElevenLabs Turbo
 * @param sceneId - Scene identifier for tracking
 * @param voiceId - ElevenLabs voice ID
 * @param text - Dialogue text to synthesize
 * @param options - Optional synthesis parameters
 */
export async function synthesizeDialogue(
  sceneId: string,
  voiceId: string,
  text: string,
  options?: Partial<AudioSynthesisOptions>
): Promise<AudioResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    // Stub mode: return mock audio URL
    console.warn('[Audio Engine] ElevenLabs API key not configured, using stub mode')
    return {
      audioUrl: `/mock/audio-${sceneId}.mp3`,
      durationSeconds: Math.ceil(text.length / 12), // ~12 chars/sec speech
      characterCount: text.length,
      cost: 0,
    }
  }

  const model = options?.model || 'eleven_turbo_v2'
  const characterCount = text.length

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: options?.stability ?? 0.5,
            similarity_boost: options?.similarityBoost ?? 0.75,
            style: options?.style ?? 0.0,
            use_speaker_boost: options?.useSpeakerBoost ?? true,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    // Convert response to blob and create object URL
    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)

    // Estimate duration (Turbo: ~12 chars/sec, Multilingual: ~10 chars/sec)
    const charsPerSecond = model === 'eleven_turbo_v2' ? 12 : 10
    const durationSeconds = Math.ceil(characterCount / charsPerSecond)

    // Calculate cost: Turbo $0.15-0.20/min effective (2025 rates)
    // Using $0.18/min as average
    const costPerMinute = 0.18
    const cost = (durationSeconds / 60) * costPerMinute

    return {
      audioUrl,
      durationSeconds,
      characterCount,
      cost,
    }
  } catch (error) {
    console.error('[Audio Engine] Synthesis error:', error)
    throw error
  }
}

/**
 * Stub for Rhubarb lip-sync (free, open-source)
 * TODO: Integrate rhubarb-lip-sync npm package when needed
 * @param audioUrl - Audio file URL
 * @param durationSeconds - Audio duration
 */
export async function generateLipSync(
  audioUrl: string,
  durationSeconds: number
): Promise<string> {
  // Stub implementation - returns mock lip-sync data
  console.log('[Audio Engine] Lip-sync stub for:', audioUrl)
  
  // In production, this would:
  // 1. Download audio from audioUrl
  // 2. Run rhubarb-lip-sync CLI or npm package
  // 3. Return lip-sync data file path/URL
  
  return `/mock/lipsync-${Date.now()}.json`
}

/**
 * Health check for ElevenLabs API
 */
export async function elevenLabsPing(): Promise<boolean> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    return false
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    })
    return response.ok
  } catch (error) {
    console.error('[Audio Engine] Ping error:', error)
    return false
  }
}


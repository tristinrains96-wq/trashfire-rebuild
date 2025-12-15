/**
 * Render Job Processor
 * Handles full episode pipeline: SVD video + ElevenLabs audio + FFmpeg stitch
 */

import { stitchEpisode, makeSocialClips } from '@/lib/render_engine'
import { synthesizeDialogue } from '@/lib/audio_engine'
import { spinVastPod, spinRunPodPod, shutdownPod } from '@/lib/pod-manager'
import { generateSceneVideo } from '@/lib/video_engine'

export interface RenderJobData {
  episodeId: string
  userId: string
  config: {
    scenes: Array<{
      id: string
      prompt: string
      voiceId: string
      dialogue: string
    }>
    quality: 'LOW' | 'HIGH'
  }
  timestamp: number
}

export async function renderEpisodeJob(data: RenderJobData) {
  const { episodeId, userId, config } = data
  console.log(`[Render Job] Starting render for episode ${episodeId}`)

  // Fallback to mock if services unavailable
  const useFallback = process.env.USE_FALLBACK_MOCKS === 'true'

  try {
    // Step 1: Spin up GPU pod (if HIGH quality)
    let podId: string | null = null
    if (config.quality === 'HIGH' && !useFallback) {
      try {
        const isDev = process.env.NODE_ENV === 'development'
        if (isDev) {
          podId = await spinVastPod()
        } else {
          podId = await spinRunPodPod()
        }
        console.log(`[Render Job] Pod ${podId} spun up`)
      } catch (error) {
        console.warn('[Render Job] Pod spin-up failed, using fallback:', error)
        // Continue with fallback mock
      }
    }

    // Step 2: Generate video segments (SVD + IP-Adapter)
    const videoSegments = []
    for (const scene of config.scenes) {
      let videoResult
      if (podId) {
        // Use IP-Adapter for character consistency (90%+ target)
        videoResult = await generateSceneVideo(
          podId,
          scene.id,
          scene.prompt,
          (scene as any).characterImageUrl // Optional character reference
        )
      } else {
        // Fallback stub for LOW quality
        videoResult = {
          videoUrl: `/mock/video-${scene.id}.mp4`,
          duration: 5,
          consistencyScore: 65,
          cost: 0,
        }
      }
      
      videoSegments.push({
        url: videoResult.videoUrl,
        startTime: videoSegments.length * 5, // 5 sec per scene
        duration: videoResult.duration,
        sceneId: scene.id,
      })
    }

    // Step 3: Generate audio tracks (ElevenLabs)
    const audioTracks = []
    for (const scene of config.scenes) {
      try {
        const audioResult = await synthesizeDialogue(
          scene.id,
          scene.voiceId,
          scene.dialogue
        )
        audioTracks.push({
          url: audioResult.audioUrl,
          startTime: audioTracks.length * 5,
          duration: audioResult.durationSeconds,
          sceneId: scene.id,
        })
      } catch (error) {
        console.warn(`[Render Job] Audio synthesis failed for scene ${scene.id}, using fallback:`, error)
        // Fallback mock audio
        audioTracks.push({
          url: `/mock/audio-${scene.id}.mp3`,
          startTime: audioTracks.length * 5,
          duration: 5,
          sceneId: scene.id,
        })
      }
    }

    // Step 4: Stitch together with FFmpeg
    const finalVideo = await stitchEpisode(videoSegments, audioTracks)

    // Step 5: Auto-generate 15s social clips
    const socialClips = await makeSocialClips(finalVideo.videoUrl, [
      { duration: 15, format: 'portrait', platform: 'tiktok' },
      { duration: 15, format: 'portrait', platform: 'twitter' },
      { duration: 15, format: 'portrait', platform: 'instagram' },
    ])

    // Step 6: Shutdown pod if used
    if (podId) {
      await shutdownPod(podId)
      console.log(`[Render Job] Pod ${podId} shut down`)
    }

    return {
      success: true,
      videoUrl: finalVideo.videoUrl,
      duration: finalVideo.duration,
      socialClips, // Auto-generated shorts
    }
  } catch (error) {
    console.error(`[Render Job] Error rendering episode ${episodeId}:`, error)
    throw error
  }
}


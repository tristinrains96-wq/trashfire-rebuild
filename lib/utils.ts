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

/**
 * Production JSON Schema (Pass D - QA Output)
 * Strict schema for final production-ready JSON with all assets
 */

import { z } from 'zod'

/**
 * Character description schema (for production)
 */
export const ProductionCharacterSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  role: z.string().min(5), // e.g., "protagonist", "antagonist", "supporting"
  voice_style: z.string().min(5),
  personality: z.string().min(5),
})

/**
 * Location description schema
 */
export const ProductionLocationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  type: z.enum(['indoor', 'outdoor', 'fantasy', 'urban', 'natural']),
  time_of_day: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
})

/**
 * Prop description schema
 */
export const ProductionPropSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  purpose: z.string().min(5), // e.g., "weapon", "key item", "decoration"
})

/**
 * Production scene schema
 */
export const ProductionSceneSchema = z.object({
  scene_number: z.number().int().positive(),
  scene_title: z.string().min(1),
  description: z.string().min(10),
  location_id: z.string().min(1), // Reference to location name
  characters_involved: z.array(z.string()).min(1), // Character names
  props_used: z.array(z.string()).optional(), // Prop names
  shot_references: z.array(z.object({
    shot_type: z.enum(['establishing', 'close-up', 'medium', 'wide', 'overhead']),
    camera_angle: z.string().optional(),
    emotion: z.string().optional(),
    description: z.string().min(5),
  })).optional(),
  dialogue: z.array(z.object({
    character: z.string().min(1),
    line: z.string().min(1),
    emotion: z.string().optional(),
    action: z.string().optional(),
  })).min(1),
  estimated_duration_seconds: z.number().int().positive(),
})

/**
 * Production JSON schema (final output)
 */
export const ProductionJsonSchema = z.object({
  episode_title: z.string().min(1),
  logline: z.string().min(10),
  characters: z.array(ProductionCharacterSchema).min(1),
  locations: z.array(ProductionLocationSchema).min(1),
  props: z.array(ProductionPropSchema).optional(),
  scenes: z.array(ProductionSceneSchema).min(1),
})

export type ProductionJson = z.infer<typeof ProductionJsonSchema>

/**
 * Validate production JSON
 */
export function validateProductionJson(
  data: unknown,
  retry = false
): { success: boolean; data?: ProductionJson; error?: string; details?: z.ZodError } {
  const result = ProductionJsonSchema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  if (retry) {
    return {
      success: false,
      error: 'Production JSON validation failed after retry',
      details: result.error,
    }
  }
  
  return {
    success: false,
    error: 'Production JSON validation failed',
    details: result.error,
  }
}


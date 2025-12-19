/**
 * Episode Data Validation Schemas
 * Uses Zod for strict JSON validation matching DB fields
 */

import { z } from 'zod'

/**
 * Beat schema (for outline)
 */
export const BeatSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  estimated_duration_seconds: z.number().int().positive(),
})

/**
 * Outline schema (Pass A output)
 */
export const OutlineSchema = z.object({
  title: z.string().min(1).max(200),
  logline: z.string().min(10).max(200),
  summary: z.string().min(50),
  act_structure: z.object({
    act_1: z.string().min(10),
    act_2: z.string().min(10),
    act_3: z.string().min(10),
  }),
  beats: z.array(BeatSchema).min(3).max(10),
})

/**
 * Scene asset prompt schema
 */
export const SceneAssetPromptSchema = z.object({
  scene_number: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(10),
  estimated_duration_seconds: z.number().int().positive(),
  visual_style: z.string().min(10),
  asset_prompts: z.array(z.string().min(5)).min(1),
  key_moments: z.array(z.string()).optional(),
})

/**
 * Scene breakdown schema (Pass B output)
 */
export const SceneBreakdownSchema = z.object({
  scenes: z.array(SceneAssetPromptSchema).min(3).max(15),
})

/**
 * Dialogue line schema
 */
export const DialogueLineSchema = z.object({
  character: z.string().min(1),
  line: z.string().min(1),
  emotion: z.string().optional(),
  action: z.string().optional(),
})

/**
 * Script scene schema
 */
export const ScriptSceneSchema = z.object({
  scene_number: z.number().int().positive(),
  scene_title: z.string().min(1),
  location: z.string().min(1),
  time_of_day: z.enum(['morning', 'afternoon', 'evening', 'night']),
  dialogue: z.array(DialogueLineSchema).min(1),
  narration: z.string().optional(),
  sound_effects: z.array(z.string()).optional(),
  music_cue: z.string().optional(),
})

/**
 * Character schema
 */
export const CharacterSchema = z.object({
  name: z.string().min(1),
  voice_style: z.string().min(5),
  personality: z.string().min(5),
})

/**
 * Script schema (Pass C output)
 */
export const ScriptSchema = z.object({
  script: z.object({
    scenes: z.array(ScriptSceneSchema).min(1),
    characters: z.array(CharacterSchema).min(1),
  }),
})

/**
 * Validation result type
 */
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: z.ZodError }

/**
 * Validate outline JSON with retry support
 */
export function validateOutline(
  data: unknown,
  retry = false
): ValidationResult<z.infer<typeof OutlineSchema>> {
  const result = OutlineSchema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  if (retry) {
    // Already retried once, return error
    return {
      success: false,
      error: 'Outline validation failed after retry',
      details: result.error,
    }
  }
  
  return {
    success: false,
    error: 'Outline validation failed',
    details: result.error,
  }
}

/**
 * Validate scene breakdown JSON with retry support
 */
export function validateSceneBreakdown(
  data: unknown,
  retry = false
): ValidationResult<z.infer<typeof SceneBreakdownSchema>> {
  const result = SceneBreakdownSchema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  if (retry) {
    return {
      success: false,
      error: 'Scene breakdown validation failed after retry',
      details: result.error,
    }
  }
  
  return {
    success: false,
    error: 'Scene breakdown validation failed',
    details: result.error,
  }
}

/**
 * Validate script JSON with retry support
 */
export function validateScript(
  data: unknown,
  retry = false
): ValidationResult<z.infer<typeof ScriptSchema>> {
  const result = ScriptSchema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  if (retry) {
    return {
      success: false,
      error: 'Script validation failed after retry',
      details: result.error,
    }
  }
  
  return {
    success: false,
    error: 'Script validation failed',
    details: result.error,
  }
}

/**
 * Parse JSON string with markdown code block cleanup
 */
export function parseJsonResponse(response: string): unknown {
  let jsonStr = response.trim()
  
  // Remove markdown code blocks
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }
  
  try {
    return JSON.parse(jsonStr)
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Repair JSON prompt for retry
 */
export function getRepairJsonPrompt(originalPrompt: string, error: string): string {
  return `${originalPrompt}

IMPORTANT: The previous response failed JSON validation with error: ${error}

Please fix the JSON structure and return ONLY valid JSON that matches the schema exactly. No markdown, no code blocks, no explanations.`
}


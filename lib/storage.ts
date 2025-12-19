/**
 * Supabase Storage integration for TrashFire
 * Server-side only - handles render uploads
 */

import { createClient } from '@supabase/supabase-js'

// Storage bucket name constant
export const RENDERS_BUCKET = 'renders'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Get Supabase admin client (server-only)
 * Uses service role key to bypass RLS for storage operations
 * Fails gracefully if service role key is missing
 */
function getSupabaseAdmin() {
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured')
  }
  
  if (!supabaseServiceKey) {
    throw new Error('Supabase service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment.')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Upload render to Supabase Storage
 * @param episodeId - Episode ID
 * @param filePathOrBuffer - File path (string) or Buffer
 * @param contentType - MIME type (e.g., 'video/mp4')
 * @returns Public or signed URL to the uploaded file
 */
export async function uploadRender(
  episodeId: string,
  filePathOrBuffer: string | Buffer,
  contentType: string = 'video/mp4'
): Promise<string> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${episodeId}/${timestamp}-animatic.mp4`
    
    // Read file if path provided
    let fileBuffer: Buffer
    if (typeof filePathOrBuffer === 'string') {
      const fs = await import('fs/promises')
      fileBuffer = await fs.readFile(filePathOrBuffer)
    } else {
      fileBuffer = filePathOrBuffer
    }

    // Upload to storage
    const { data, error } = await supabase.storage
      .from(RENDERS_BUCKET)
      .upload(filename, fileBuffer, {
        contentType,
        upsert: false, // Don't overwrite existing files
      })

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(RENDERS_BUCKET)
      .getPublicUrl(filename)

    if (!urlData?.publicUrl) {
      // Fallback: generate signed URL (valid for 1 hour)
      const { data: signedData, error: signedError } = await supabase.storage
        .from(RENDERS_BUCKET)
        .createSignedUrl(filename, 3600) // 1 hour

      if (signedError || !signedData?.signedUrl) {
        throw new Error('Failed to generate file URL')
      }

      return signedData.signedUrl
    }

    return urlData.publicUrl
  } catch (error: any) {
    // Never log keys or secrets
    const errorMessage = error.message || 'Unknown storage error'
    if (errorMessage.includes('key') || errorMessage.includes('secret')) {
      throw new Error('Storage configuration error')
    }
    throw error
  }
}

/**
 * Check if storage bucket exists
 * Returns true if bucket is accessible, false otherwise
 */
export async function checkStorageBucket(): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage
      .from(RENDERS_BUCKET)
      .list('', { limit: 1 })
    
    return !error
  } catch (error) {
    return false
  }
}







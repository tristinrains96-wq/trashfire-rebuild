/**
 * Storage stub for Public UI Demo Branch
 * NO REAL STORAGE - FOR DEMO ONLY
 * All uploads return placeholder URLs
 */

export const RENDERS_BUCKET = 'renders'

/**
 * Upload render stub (returns placeholder URL)
 */
export async function uploadRender(
  episodeId: string,
  filePathOrBuffer: string | Buffer,
  contentType: string = 'video/mp4'
): Promise<string> {
  // Demo mode: return placeholder URL
  return `/mock/preview.svg`
}

/**
 * Check storage bucket stub (always returns true in demo)
 */
export async function checkStorageBucket(): Promise<boolean> {
  return true
}

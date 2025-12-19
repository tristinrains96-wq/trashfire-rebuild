/**
 * Supabase client stub for Public UI Demo Branch
 * NO REAL DATABASE - FOR DEMO ONLY
 * All database operations return mock data
 */

// Stub types (for TypeScript compatibility)
export interface Project {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at?: string
}

export interface Episode {
  id: string
  project_id: string
  title: string
  outline_json?: any
  script_json?: any
  status: 'draft' | 'generating' | 'complete' | 'error'
  created_at: string
  updated_at?: string
}

export interface Scene {
  id: string
  episode_id: string
  description: string
  assets_json?: any
  order_index: number
  created_at: string
}

export interface Asset {
  id: string
  scene_id: string
  type: 'character' | 'location' | 'voice'
  prompt: string
  preview_url?: string
  status: 'pending' | 'generating' | 'complete' | 'error'
  created_at: string
}

export interface Job {
  id: string
  episode_id: string
  type: 'outline' | 'script' | 'render'
  status: 'pending' | 'processing' | 'complete' | 'error'
  progress: number
  cost_estimate?: number
  created_at: string
  updated_at?: string
}

// Stub Supabase client (returns empty/mock data)
export const supabase = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
  storage: {
    from: () => ({
      upload: () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '/placeholder.svg' }, error: null }),
      createSignedUrl: () => ({ data: { signedUrl: '/placeholder.svg' }, error: null }),
      list: () => ({ data: [], error: null }),
    }),
  },
}

// Stub server client creation
export function createServerClient(userId?: string) {
  return supabase
}

// Stub authenticated client
export async function getAuthenticatedSupabaseClient() {
  return supabase
}

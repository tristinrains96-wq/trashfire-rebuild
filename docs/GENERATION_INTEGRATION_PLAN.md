# Generation Integration Plan

Plan for integrating AI generation endpoints into TrashFire v1.0.

## Endpoints to Add First

### 1. Series Kit Generation
**Endpoint:** `POST /api/series-kit/generate`
**Purpose:** Generate character and location assets for Series Kit
**Provider:** Leonardo AI
**Priority:** High (foundational for series consistency)

**Request:**
```typescript
{
  type: 'character' | 'location',
  prompt: string,
  style: string,
  projectId: string
}
```

**Response:**
```typescript
{
  assetId: string,
  imageUrl: string,
  status: 'pending' | 'completed' | 'failed'
}
```

### 2. Episode Wizard Generate
**Endpoint:** `POST /api/episodes/generate`
**Purpose:** Generate episode from user input (script, outline, etc.)
**Provider:** Groq (LLM) + SDXL (images) + Kling/Hailuo (motion)
**Priority:** High (core feature)

**Request:**
```typescript
{
  projectId: string,
  episodeNumber: number,
  prompt: string,
  outline?: string,
  script?: string
}
```

**Response:**
```typescript
{
  episodeId: string,
  jobId: string,
  status: 'queued' | 'processing' | 'completed' | 'failed',
  estimatedMinutes: number
}
```

### 3. Hero Clip Generate
**Endpoint:** `POST /api/scenes/generate-hero`
**Purpose:** Generate hero burst/clip for specific scene
**Provider:** Kling (default) or Hailuo (upsell)
**Priority:** Medium (enhancement feature)

**Request:**
```typescript
{
  sceneId: string,
  prompt: string,
  provider: 'kling' | 'hailuo',
  quality: 'standard' | 'premium'
}
```

**Response:**
```typescript
{
  clipId: string,
  jobId: string,
  status: 'queued' | 'processing' | 'completed' | 'failed',
  videoUrl?: string
}
```

## API Client Wrappers Location

### Frontend API Client Structure

**Base Location:** `lib/api/`

**File Structure:**
```
lib/api/
├── client.ts              # Base API client (fetch wrapper)
├── episodes.ts            # Episode API methods
├── seriesKit.ts           # Series Kit API methods
├── scenes.ts              # Scene API methods
├── render.ts               # Render API methods
└── types.ts                # API types/interfaces
```

### Base Client (`lib/api/client.ts`)

```typescript
// Base fetch wrapper with auth, error handling, etc.
export const apiClient = {
  get: (endpoint: string) => fetch(...),
  post: (endpoint: string, data: any) => fetch(...),
  // ...
}
```

### API Modules

**Episodes API** (`lib/api/episodes.ts`)
```typescript
export const episodesApi = {
  generate: (data: GenerateEpisodeRequest) => apiClient.post('/api/episodes/generate', data),
  get: (id: string) => apiClient.get(`/api/episodes/${id}`),
  // ...
}
```

**Series Kit API** (`lib/api/seriesKit.ts`)
```typescript
export const seriesKitApi = {
  generate: (data: GenerateSeriesKitRequest) => apiClient.post('/api/series-kit/generate', data),
  // ...
}
```

**Scenes API** (`lib/api/scenes.ts`)
```typescript
export const scenesApi = {
  generateHero: (data: GenerateHeroRequest) => apiClient.post('/api/scenes/generate-hero', data),
  // ...
}
```

### Custom Hooks Location

**Hooks Location:** `hooks/`

**New Hooks to Create:**
```
hooks/
├── useEpisodeGeneration.ts    # Episode generation hook
├── useSeriesKitGeneration.ts  # Series Kit generation hook
├── useHeroClipGeneration.ts    # Hero clip generation hook
└── useRenderStatus.ts          # Render status polling hook
```

**Example Hook** (`hooks/useEpisodeGeneration.ts`):
```typescript
export function useEpisodeGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const generate = async (data: GenerateEpisodeRequest) => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await episodesApi.generate(data)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }
  
  return { generate, isGenerating, error }
}
```

## UI Screens to Wire First

### 1. Episode Wizard
**Location:** `app/workspace/page.tsx` (Plan mode)
**Components:**
- `components/workspace/GuidedSteps.tsx` - Wizard steps
- `components/workspace/PlanModeContent.tsx` - Plan mode UI

**Integration Points:**
- "Generate Episode" button → calls `useEpisodeGeneration().generate()`
- Shows progress during generation
- Updates `useWorkspace()` store with generated episode
- Redirects to Build mode when complete

**Status Display:**
- Use `components/stage/GenBox.tsx` for generation status
- Show progress bar during generation
- Display errors if generation fails

### 2. Timeline / Scene Builder
**Location:** `app/workspace/scenes/page.tsx`
**Components:**
- `components/scenes/StoryboardStrip.tsx` - Timeline view
- `components/panels/ScenesPanel.tsx` - Scene list
- `components/episode/SceneCard.tsx` - Individual scene cards

**Integration Points:**
- "Generate Hero Clip" button on scene cards → calls `useHeroClipGeneration().generate()`
- Shows generation status on scene card
- Updates scene with video URL when complete
- Preview in timeline when ready

**Status Display:**
- Inline status on scene cards
- Progress indicator
- Error handling

### 3. Export / Render
**Location:** `components/workspace/ExportActions.tsx`
**Components:**
- `components/workspace/ExportActions.tsx` - Export UI
- `components/workspace/PreviewModeContent.tsx` - Preview mode

**Integration Points:**
- "Render Episode" button → calls render API
- Shows render progress
- Displays final video when complete
- Download/export options

**Status Display:**
- Full-screen render progress
- Estimated time remaining
- Final video preview

## Quotas / Overages Concept

### Reservation System

**Pattern:** Reserve credits before generation, commit/release after

**Flow:**
1. **Reserve** - User initiates generation → reserve credits
2. **Generate** - Process generation
3. **Commit** - On success → commit credits (deduct)
4. **Release** - On failure → release credits (refund)

### Implementation

**Reservation API** (`lib/api/quota.ts`):
```typescript
export const quotaApi = {
  // Reserve credits before generation
  reserve: async (userId: string, amount: number, type: 'episode' | 'scene' | 'hero') => {
    const response = await apiClient.post('/api/quota/reserve', {
      userId,
      amount,
      type
    })
    return response.reservationId
  },
  
  // Commit credits after successful generation
  commit: async (reservationId: string) => {
    await apiClient.post(`/api/quota/commit/${reservationId}`)
  },
  
  // Release credits on failure
  release: async (reservationId: string) => {
    await apiClient.post(`/api/quota/release/${reservationId}`)
  }
}
```

### Usage in Hooks

**Example** (`hooks/useEpisodeGeneration.ts`):
```typescript
export function useEpisodeGeneration() {
  const generate = async (data: GenerateEpisodeRequest) => {
    // 1. Reserve credits
    const reservationId = await quotaApi.reserve(
      userId,
      estimatedMinutes,
      'episode'
    )
    
    try {
      // 2. Generate
      const result = await episodesApi.generate(data)
      
      // 3. Commit credits
      await quotaApi.commit(reservationId)
      
      return result
    } catch (error) {
      // 4. Release credits on failure
      await quotaApi.release(reservationId)
      throw error
    }
  }
}
```

### Quota Limits

**Per-User Limits:**
- Daily episode limit
- Daily scene limit
- Monthly credit cap

**Global Limits:**
- Global daily spend cap
- Rate limiting per user

**Check Before Generation:**
```typescript
// Check quota before reserving
const check = await quotaApi.check(userId, estimatedMinutes)
if (!check.allowed) {
  throw new Error(check.reason)
}
```

## Implementation Order

### Phase 1: Foundation
1. Create `lib/api/client.ts` - Base API client
2. Create `lib/api/types.ts` - API types
3. Set up error handling and auth headers

### Phase 2: Series Kit
1. Create `lib/api/seriesKit.ts`
2. Create `hooks/useSeriesKitGeneration.ts`
3. Wire Series Kit UI in ProjectLab

### Phase 3: Episode Generation
1. Create `lib/api/episodes.ts`
2. Create `hooks/useEpisodeGeneration.ts`
3. Wire Episode Wizard (Plan mode)
4. Add quota reservation system

### Phase 4: Scene Generation
1. Create `lib/api/scenes.ts`
2. Create `hooks/useHeroClipGeneration.ts`
3. Wire Timeline/Scene Builder
4. Add scene status updates

### Phase 5: Render/Export
1. Create `lib/api/render.ts`
2. Create `hooks/useRenderStatus.ts`
3. Wire Export Actions
4. Add final video preview

## Error Handling

**Pattern:** Consistent error handling across all API calls

```typescript
try {
  const result = await api.generate(data)
  // Success
} catch (error) {
  if (error.status === 429) {
    // Rate limit - show "try again later"
  } else if (error.status === 402) {
    // Insufficient credits - show upgrade prompt
  } else {
    // Generic error - show error message
  }
}
```

## Status Polling

**Pattern:** Poll for generation status

```typescript
// Poll render status
const pollStatus = async (jobId: string) => {
  const interval = setInterval(async () => {
    const status = await renderApi.getStatus(jobId)
    if (status === 'completed' || status === 'failed') {
      clearInterval(interval)
    }
  }, 2000) // Poll every 2 seconds
}
```

---

**Last Updated:** Generation integration plan for v1.0
**Status:** Ready for implementation


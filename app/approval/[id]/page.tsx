'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Lock, 
  Unlock, 
  RefreshCw, 
  Edit, 
  Check, 
  X, 
  Sparkles,
  DollarSign,
  Image as ImageIcon,
  Film,
  Play,
  Download,
  Loader2,
  Volume2,
  AlertCircle
} from 'lucide-react'

interface Asset {
  id: string
  name: string
  type: 'character' | 'location' | 'prop'
  description: string
  prompt: string
  locked: boolean
  version: number
  locked_variant_id: string | null
  preview_url: string | null
  variants: Array<{
    id: string
    variant: string
    prompt: string
    preview_url: string | null
  }>
}

interface UsageStats {
  rerollsUsed: number
  rerollsLimit: number
  locksUsed: number
  locksLimit: number
  costEstUsd: number
  quotas?: any
  spend?: any
}

export default function ApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const episodeId = params.id as string

  const [assets, setAssets] = useState<Asset[]>([])
  const [usage, setUsage] = useState<UsageStats>({
    rerollsUsed: 0,
    rerollsLimit: 3,
    locksUsed: 0,
    locksLimit: 10,
    costEstUsd: 0,
  })
  const [canGenerate, setCanGenerate] = useState(true)
  const [loading, setLoading] = useState(true)
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [regeneratingAssetId, setRegeneratingAssetId] = useState<string | null>(null)
  const [animaticRenders, setAnimaticRenders] = useState<Array<{ id: string; url: string; kind: string; duration_s: number; created_at: string }>>([])
  const [generatingAnimatic, setGeneratingAnimatic] = useState(false)
  const [animaticJobId, setAnimaticJobId] = useState<string | null>(null)
  const [animaticProgress, setAnimaticProgress] = useState(0)
  const [voicedAnimatic, setVoicedAnimatic] = useState(false)
  const [elevenLabsConfigured, setElevenLabsConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    // Demo mode: use mock data
    if (isDemoMode()) {
      loadMockData()
      return
    }
    loadAssets()
    loadUsage()
    checkGuardrails()
    loadRenders()
    checkElevenLabs()
  }, [episodeId])

  // Demo mode check
  function isDemoMode(): boolean {
    return typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  }

  // Load mock data for demo mode
  function loadMockData() {
    setLoading(false)
    setAssets([
      {
        id: 'char_rin',
        name: 'Rin',
        type: 'character' as const,
        description: 'A determined young warrior',
        prompt: 'anime character, red hair, determined expression',
        locked: false,
        version: 1,
        locked_variant_id: null,
        preview_url: '/trashfire-logo.png',
        variants: [],
      },
      {
        id: 'bg_rooftop',
        name: 'Rooftop Night',
        type: 'location' as const,
        description: 'School rooftop at night',
        prompt: 'anime background, school rooftop, night, city lights',
        locked: false,
        version: 1,
        locked_variant_id: null,
        preview_url: '/trashfire-logo.png',
        variants: [],
      },
    ])
    setUsage({
      rerollsUsed: 0,
      rerollsLimit: 3,
      locksUsed: 0,
      locksLimit: 10,
      costEstUsd: 0.0,
    })
    setCanGenerate(true)
    setElevenLabsConfigured(false)
  }

  async function checkElevenLabs() {
    // Demo mode: always false
    if (isDemoMode()) {
      setElevenLabsConfigured(false)
      return
    }
    try {
      const res = await fetch('/api/setup/status')
      if (res.ok) {
        const data = await res.json()
        setElevenLabsConfigured(data.elevenlabs?.keyPresent && data.elevenlabs?.connected)
      }
    } catch (error) {
      console.error('[Approval] Check ElevenLabs error:', error)
      setElevenLabsConfigured(false)
    }
  }

  // Poll animatic job status if generating (disabled in demo mode)
  useEffect(() => {
    if (!animaticJobId || isDemoMode()) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/episodes/${episodeId}/animatic/status?jobId=${animaticJobId}`)
        if (!res.ok) return
        const status = await res.json()
        
        setAnimaticProgress(status.progress || 0)

        if (status.state === 'completed') {
          setGeneratingAnimatic(false)
          setAnimaticJobId(null)
          setAnimaticProgress(0)
          await loadRenders()
        } else if (status.state === 'failed') {
          setGeneratingAnimatic(false)
          setAnimaticJobId(null)
          setAnimaticProgress(0)
          alert('Animatic generation failed. Please try again.')
        }
      } catch (error) {
        console.error('[Approval] Animatic status check error:', error)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [animaticJobId, episodeId])

  async function checkGuardrails() {
    // Demo mode: always allow
    if (isDemoMode()) {
      setCanGenerate(true)
      return
    }
    try {
      const res = await fetch('/api/guardrails/check')
      if (res.ok) {
        const data = await res.json()
        setCanGenerate(data.canGenerate)
      }
    } catch (error) {
      console.error('[Approval] Guardrails check error:', error)
      setCanGenerate(true) // Fail open
    }
  }

  async function loadAssets() {
    // Demo mode: use mock data
    if (isDemoMode()) {
      loadMockData()
      return
    }
    try {
      const res = await fetch(`/api/episodes/${episodeId}/assets`)
      if (!res.ok) throw new Error('Failed to load assets')
      const data = await res.json()
      setAssets(data.assets || [])
    } catch (error) {
      console.error('[Approval] Load assets error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadUsage() {
    // Demo mode: use defaults
    if (isDemoMode()) {
      setUsage({
        rerollsUsed: 0,
        rerollsLimit: 3,
        locksUsed: 0,
        locksLimit: 10,
        costEstUsd: 0.0,
      })
      return
    }
    try {
      const res = await fetch(`/api/episodes/${episodeId}/usage`)
      if (!res.ok) throw new Error('Failed to load usage')
      const data = await res.json()
      setUsage({
        rerollsUsed: data.rerollsUsed || 0,
        rerollsLimit: data.rerollsLimit || 3,
        locksUsed: data.locksUsed || 0,
        locksLimit: data.locksLimit || 10,
        costEstUsd: data.costEstUsd || 0,
        // Include quota info if available
        quotas: data.quotas,
        spend: data.spend,
      })
    } catch (error) {
      console.error('[Approval] Load usage error:', error)
    }
  }

  async function handleEdit(asset: Asset) {
    setEditingAssetId(asset.id)
    setEditPrompt(asset.prompt)
  }

  async function handleSaveEdit(assetId: string) {
    // Demo mode: show message
    if (isDemoMode()) {
      alert('Demo Mode: Asset editing is disabled. This is a UI-only demo branch.')
      setEditingAssetId(null)
      return
    }
    try {
      const res = await fetch(`/api/episodes/${episodeId}/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: editPrompt }),
      })
      if (!res.ok) throw new Error('Failed to update asset')
      await loadAssets()
      setEditingAssetId(null)
    } catch (error) {
      console.error('[Approval] Save edit error:', error)
      alert('Failed to save changes')
    }
  }

  async function handleRegenerate(assetId: string) {
    // Demo mode: show message
    if (isDemoMode()) {
      alert('Demo Mode: Asset regeneration is disabled. This is a UI-only demo branch.')
      return
    }
    if (usage.rerollsUsed >= usage.rerollsLimit) {
      alert(`Reroll limit reached (${usage.rerollsLimit} per asset)`)
      return
    }

    setRegeneratingAssetId(assetId)
    try {
      const res = await fetch(`/api/episodes/${episodeId}/assets/${assetId}/regenerate`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to regenerate asset')
      await loadAssets()
      await loadUsage()
    } catch (error) {
      console.error('[Approval] Regenerate error:', error)
      alert('Failed to regenerate asset')
    } finally {
      setRegeneratingAssetId(null)
    }
  }

  async function handleLock(assetId: string, variantId: string | null) {
    // Demo mode: show message
    if (isDemoMode()) {
      alert('Demo Mode: Asset locking is disabled. This is a UI-only demo branch.')
      return
    }
    try {
      const res = await fetch(`/api/episodes/${episodeId}/assets/${assetId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: variantId }),
      })
      if (!res.ok) throw new Error('Failed to lock asset')
      await loadAssets()
      await loadUsage()
    } catch (error) {
      console.error('[Approval] Lock error:', error)
      alert('Failed to lock asset')
    }
  }

  async function handleUnlock(assetId: string) {
    // Demo mode: show message
    if (isDemoMode()) {
      alert('Demo Mode: Asset unlocking is disabled. This is a UI-only demo branch.')
      return
    }
    try {
      const res = await fetch(`/api/episodes/${episodeId}/assets/${assetId}/unlock`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to unlock asset')
      await loadAssets()
      await loadUsage()
    } catch (error) {
      console.error('[Approval] Unlock error:', error)
      alert('Failed to unlock asset')
    }
  }

  async function loadRenders() {
    // Demo mode: no renders
    if (isDemoMode()) {
      setAnimaticRenders([])
      return
    }
    try {
      const res = await fetch(`/api/episodes/${episodeId}/renders`)
      if (!res.ok) return
      const data = await res.json()
      setAnimaticRenders(data.renders || [])
    } catch (error) {
      console.error('[Approval] Load renders error:', error)
    }
  }

  async function handleGenerateAnimatic() {
    if (generatingAnimatic) return

    // Demo mode: show message
    if (isDemoMode()) {
      alert('Demo Mode: Animatic generation is disabled. This is a UI-only demo branch.')
      return
    }

    // Check if voiced is requested but ElevenLabs is not configured
    if (voicedAnimatic && !elevenLabsConfigured) {
      alert('ElevenLabs is not configured. Please set ELEVENLABS_API_KEY in your environment variables. Visit /setup to check your configuration.')
      return
    }

    setGeneratingAnimatic(true)
    try {
      const res = await fetch(`/api/episodes/${episodeId}/animatic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'preview', 
          fps: 24,
          voiced: voicedAnimatic,
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to start animatic generation')
      }

      const data = await res.json()
      setAnimaticJobId(data.jobId)
      setAnimaticProgress(0)
    } catch (error: any) {
      console.error('[Approval] Generate animatic error:', error)
      alert(error.message || 'Failed to generate animatic')
      setGeneratingAnimatic(false)
    }
  }

  async function handleApprove() {
    router.push(`/workspace/${episodeId}?section=preview`)
  }

  const characters = assets.filter(a => a.type === 'character')
  const locations = assets.filter(a => a.type === 'location')
  const props = assets.filter(a => a.type === 'prop')

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-muted-foreground">Loading assets...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Asset Approval</h1>
            <p className="text-muted-foreground mt-1">Review and approve assets for your episode</p>
          </div>
          <Button onClick={handleApprove} size="lg" className="w-full md:w-auto">
            Approve & Preview
          </Button>
        </div>

        {/* Usage Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Rerolls Left</div>
                <div className="text-2xl font-bold">
                  {usage.rerollsLimit - usage.rerollsUsed}/{usage.rerollsLimit}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Locks</div>
                <div className="text-2xl font-bold">
                  {usage.locksUsed}/{usage.locksLimit}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Est. Cost</div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <DollarSign className="h-5 w-5" />
                  {usage.costEstUsd.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Assets</div>
                <div className="text-2xl font-bold">{assets.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animatic Preview Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Animatic Preview
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate a video preview with placeholder frames, subtitles, and simple motion
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="voiced-toggle" className="text-sm cursor-pointer">
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-4 w-4" />
                      Voiced
                    </div>
                  </Label>
                  <Switch
                    id="voiced-toggle"
                    checked={voicedAnimatic}
                    onCheckedChange={setVoicedAnimatic}
                    disabled={generatingAnimatic || !elevenLabsConfigured}
                  />
                </div>
                {voicedAnimatic && !elevenLabsConfigured && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>ElevenLabs not configured</span>
                    <a href="/setup" className="underline ml-1">Setup</a>
                  </div>
                )}
                <Button
                  onClick={handleGenerateAnimatic}
                  disabled={generatingAnimatic || (voicedAnimatic && !elevenLabsConfigured)}
                  className="flex items-center gap-2"
                >
                  {generatingAnimatic ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Generate Animatic {voicedAnimatic ? '(Voiced)' : '(Silent)'}
                    </>
                  )}
                </Button>
              </div>
            </div>
            {generatingAnimatic && animaticProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${animaticProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Progress: {animaticProgress}%</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {animaticRenders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No animatic previews yet. Click &quot;Generate Animatic Preview&quot; to create one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {animaticRenders.map((render) => (
                  <div key={render.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{render.kind}</Badge>
                        {render.duration_s && (
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(render.duration_s / 60)}:{(render.duration_s % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <a
                        href={render.url}
                        download
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download MP4
                      </a>
                    </div>
                    <video
                      src={render.url}
                      controls
                      className="w-full rounded-lg"
                      style={{ maxHeight: '400px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <p className="text-xs text-muted-foreground mt-2">
                      Generated {new Date(render.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Tabs */}
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="characters">Characters ({characters.length})</TabsTrigger>
            <TabsTrigger value="locations">Locations ({locations.length})</TabsTrigger>
            <TabsTrigger value="props">Props ({props.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="space-y-4 mt-4">
            {characters.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                editing={editingAssetId === asset.id}
                editPrompt={editPrompt}
                onEditPromptChange={setEditPrompt}
                onEdit={() => handleEdit(asset)}
                onSave={() => handleSaveEdit(asset.id)}
                onCancel={() => setEditingAssetId(null)}
                onRegenerate={() => handleRegenerate(asset.id)}
                onLock={(variantId) => handleLock(asset.id, variantId)}
                onUnlock={() => handleUnlock(asset.id)}
                regenerating={regeneratingAssetId === asset.id}
                canReroll={usage.rerollsUsed < usage.rerollsLimit}
                canGenerate={canGenerate}
              />
            ))}
          </TabsContent>

          <TabsContent value="locations" className="space-y-4 mt-4">
            {locations.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                editing={editingAssetId === asset.id}
                editPrompt={editPrompt}
                onEditPromptChange={setEditPrompt}
                onEdit={() => handleEdit(asset)}
                onSave={() => handleSaveEdit(asset.id)}
                onCancel={() => setEditingAssetId(null)}
                onRegenerate={() => handleRegenerate(asset.id)}
                onLock={(variantId) => handleLock(asset.id, variantId)}
                onUnlock={() => handleUnlock(asset.id)}
                regenerating={regeneratingAssetId === asset.id}
                canReroll={usage.rerollsUsed < usage.rerollsLimit}
                canGenerate={canGenerate}
              />
            ))}
          </TabsContent>

          <TabsContent value="props" className="space-y-4 mt-4">
            {props.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                editing={editingAssetId === asset.id}
                editPrompt={editPrompt}
                onEditPromptChange={setEditPrompt}
                onEdit={() => handleEdit(asset)}
                onSave={() => handleSaveEdit(asset.id)}
                onCancel={() => setEditingAssetId(null)}
                onRegenerate={() => handleRegenerate(asset.id)}
                onLock={(variantId) => handleLock(asset.id, variantId)}
                onUnlock={() => handleUnlock(asset.id)}
                regenerating={regeneratingAssetId === asset.id}
                canReroll={usage.rerollsUsed < usage.rerollsLimit}
                canGenerate={canGenerate}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AssetCard({
  asset,
  editing,
  editPrompt,
  onEditPromptChange,
  onEdit,
  onSave,
  onCancel,
  onRegenerate,
  onLock,
  onUnlock,
  regenerating,
  canReroll,
  canGenerate,
}: {
  asset: Asset
  editing: boolean
  editPrompt: string
  onEditPromptChange: (prompt: string) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onRegenerate: () => void
  onLock: (variantId: string | null) => void
  onUnlock: () => void
  regenerating: boolean
  canReroll: boolean
  canGenerate: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {asset.name}
              {asset.locked && <Badge variant="secondary">Locked</Badge>}
              <Badge variant="outline">v{asset.version}</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{asset.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        {asset.preview_url ? (
          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <img src={asset.preview_url} alt={asset.name} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Prompt */}
        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={editPrompt}
              onChange={(e) => onEditPromptChange(e.target.value)}
              rows={4}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button onClick={onSave} size="sm">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button onClick={onCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium mb-1">Prompt</div>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{asset.prompt}</p>
          </div>
        )}

        {/* Variants */}
        {asset.variants && asset.variants.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Variants</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {asset.variants.map(variant => (
                <div key={variant.id} className="bg-muted p-2 rounded text-xs">
                  <div className="font-medium">{variant.variant}</div>
                  <div className="text-muted-foreground truncate">{variant.prompt}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {!editing && (
            <>
              <Button onClick={onEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                onClick={onRegenerate}
                variant="outline"
                size="sm"
                disabled={regenerating || !canReroll || asset.locked || !canGenerate}
                title={!canGenerate ? 'Generation disabled or quota exceeded' : undefined}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${regenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              {asset.locked ? (
                <Button onClick={onUnlock} variant="outline" size="sm">
                  <Unlock className="h-4 w-4 mr-1" />
                  Unlock
                </Button>
              ) : (
                <Button onClick={() => onLock(asset.locked_variant_id)} variant="outline" size="sm">
                  <Lock className="h-4 w-4 mr-1" />
                  Lock
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Eye,
  Focus,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { ProjectLabState, SelectedTarget, SlotCategory, SlotItem } from '@/lib/demo/projectLabTypes'
import { toast } from '@/lib/toast'

interface InspectorPanelProps {
  selected: SelectedTarget
  projectLabState: ProjectLabState
  onUpdateState: (updates: Partial<ProjectLabState>) => void
  onClearSelection: () => void
}

const categoryLabels: Record<SlotCategory, string> = {
  characters: 'Characters',
  locations: 'Locations',
  props: 'Props',
  scenes: 'Scenes',
  voices: 'Voices',
  episode: 'Episode',
}

const voiceOptions = ['Nova', 'Rex', 'Mina', 'Kira']

const studioTips: Record<SlotCategory, string[]> = {
  characters: [
    'Add strong silhouette',
    'Limit colors to 3–5',
    'Specify eye shape',
    'Add accessory',
    'Add pose notes',
    'Define expression',
    'Include clothing details',
  ],
  locations: [
    'Establishing shot',
    'Foreground layer',
    'Atmospheric haze',
    'Time of day',
    'Color script',
    'Depth cues',
    'Weather conditions',
  ],
  props: [
    'Add rim light',
    'Speed lines',
    'Impact frame',
    'Motion blur cue',
    'Glint',
    'Texture detail',
    'Scale reference',
  ],
  scenes: [
    'Camera angle',
    'Lighting mood',
    'Pacing notes',
    'Transition style',
    'Sound cues',
  ],
  voices: [
    'Pitch range',
    'Emotion level',
    'Speaking pace',
    'Accent notes',
  ],
  episode: [
    'Theme notes',
    'Tone guide',
    'Arc structure',
  ],
}

export default function InspectorPanel({
  selected,
  projectLabState,
  onUpdateState,
  onClearSelection,
}: InspectorPanelProps) {
  const [showNegativePrompt, setShowNegativePrompt] = useState(false)
  const [lastSavedPrompt, setLastSavedPrompt] = useState<string>('')
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  // Get the selected slot
  const getSelectedSlot = (): SlotItem | null => {
    if (!selected) return null

    if (selected.kind === 'slot') {
      const slots = projectLabState.categories[selected.categoryId]
      return slots.find((s) => s.id === selected.slotId) || null
    } else {
      // Scene asset
      const slots = projectLabState.categories[selected.assetRef.categoryId]
      return slots.find((s) => s.id === selected.assetRef.slotId) || null
    }
  }

  const slot = getSelectedSlot()
  const category = selected?.kind === 'slot' ? selected.categoryId : selected?.assetRef.categoryId

  // Save last prompt when slot changes
  useEffect(() => {
    if (slot?.prompt) {
      setLastSavedPrompt(slot.prompt)
    } else {
      setLastSavedPrompt('')
    }
  }, [slot?.id, slot?.prompt])

  // Keyboard shortcuts
  useEffect(() => {
    if (!selected) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc: clear selection
      if (e.key === 'Escape') {
        onClearSelection()
        return
      }

      // Ctrl/Cmd+L: Lock/Unlock
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()
        if (slot?.status === 'draft') {
          handleLock()
        } else if (slot?.status === 'locked') {
          handleUnlock()
        }
        return
      }

      // Enter: Generate Preview (only if focused in actions area)
      if (e.key === 'Enter' && actionsRef.current?.contains(document.activeElement)) {
        e.preventDefault()
        handleGeneratePreview()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, slot?.status])

  const updateSlot = (updates: Partial<SlotItem>) => {
    if (!selected || !slot) return

    const categoryId = selected.kind === 'slot' ? selected.categoryId : selected.assetRef.categoryId
    const slotId = selected.kind === 'slot' ? selected.slotId : selected.assetRef.slotId

    const updatedCategories = { ...projectLabState.categories }
    const slots = [...updatedCategories[categoryId]]
    const slotIndex = slots.findIndex((s) => s.id === slotId)

    if (slotIndex !== -1) {
      slots[slotIndex] = { ...slots[slotIndex], ...updates }
      updatedCategories[categoryId] = slots
      onUpdateState({ categories: updatedCategories })
    }
  }

  const handlePromptChange = (value: string) => {
    updateSlot({ prompt: value })
  }

  const handleNegativePromptChange = (value: string) => {
    updateSlot({ negativePrompt: value })
  }

  const handleSeedChange = (value: string) => {
    const seed = value === '' ? undefined : parseInt(value, 10)
    if (isNaN(seed as number) && value !== '') return
    updateSlot({ seed })
  }

  const handleLockToggle = (lockType: keyof NonNullable<SlotItem['locks']>) => {
    const currentLocks = slot?.locks || {
      palette: false,
      line: false,
      outfit: false,
      face: false,
    }
    updateSlot({
      locks: {
        ...currentLocks,
        [lockType]: !currentLocks[lockType],
      },
    })
  }

  const handleVoiceChange = (voiceId: string) => {
    updateSlot({ voiceId })
  }

  const handleGeneratePreview = () => {
    if (!slot) return

    const now = new Date().toISOString()
    const currentUsage = slot.usage || { previewRerolls: 0 }
    updateSlot({
      status: 'draft',
      lastGeneratedAt: now,
      usage: {
        previewRerolls: currentUsage.previewRerolls + 1,
      },
    })
    toast.success('Preview generated (mock)')
  }

  const handleLock = () => {
    if (!slot || slot.status !== 'draft') return
    updateSlot({ status: 'locked' })
    toast.success('Slot locked')
  }

  const handleUnlock = () => {
    if (!slot || slot.status !== 'locked') return
    updateSlot({ status: 'draft' })
    toast.success('Slot unlocked')
  }

  const handleRevert = () => {
    if (!slot) return
    updateSlot({ prompt: lastSavedPrompt })
    toast.info('Prompt reverted')
  }

  const handleDuplicate = () => {
    if (!selected || !slot) return

    const categoryId = selected.kind === 'slot' ? selected.categoryId : selected.assetRef.categoryId
    const slots = projectLabState.categories[categoryId]
    const newSlot: SlotItem = {
      ...slot,
      id: `${slot.id}-copy-${Date.now()}`,
      title: `${slot.title} (Copy)`,
      status: 'draft',
    }
    const updatedCategories = { ...projectLabState.categories }
    updatedCategories[categoryId] = [...slots, newSlot]
    onUpdateState({ categories: updatedCategories })
    toast.success('Slot duplicated')
  }

  const handleDelete = () => {
    if (!selected || !slot) return

    if (selected.kind === 'scene') {
      // Remove from scene composition
      const composition = projectLabState.sceneCompositions[selected.sceneId]
      if (composition) {
        const updatedCompositions = { ...projectLabState.sceneCompositions }
        if (selected.assetRef.categoryId === 'characters') {
          updatedCompositions[selected.sceneId] = {
            ...composition,
            characterIds: composition.characterIds.filter((id) => id !== selected.assetRef.slotId),
          }
        } else if (selected.assetRef.categoryId === 'locations') {
          updatedCompositions[selected.sceneId] = {
            ...composition,
            locationId: undefined,
          }
        } else if (selected.assetRef.categoryId === 'props') {
          updatedCompositions[selected.sceneId] = {
            ...composition,
            propIds: composition.propIds.filter((id) => id !== selected.assetRef.slotId),
          }
        }
        onUpdateState({ sceneCompositions: updatedCompositions })
        toast.success('Asset removed from scene')
        onClearSelection()
      }
    } else {
      // Clear slot if safe (only if empty or draft)
      if (slot.status === 'empty' || slot.status === 'draft') {
        const categoryId = selected.categoryId
        const updatedCategories = { ...projectLabState.categories }
        const slots = updatedCategories[categoryId]
        const slotIndex = slots.findIndex((s) => s.id === selected.slotId)
        if (slotIndex !== -1) {
          slots[slotIndex] = {
            ...slots[slotIndex],
            prompt: undefined,
            status: 'empty' as const,
          }
          updatedCategories[categoryId] = slots
          onUpdateState({ categories: updatedCategories })
          toast.success('Slot cleared')
        }
      } else {
        toast.error('Cannot delete locked slot')
      }
    }
  }

  const handleFocus = () => {
    // Scroll to selected card (mock - just show toast)
    toast.info('Focusing on selected item (mock)')
  }

  const handleTipClick = (tip: string) => {
    if (!slot || !promptTextareaRef.current) return
    const currentPrompt = slot.prompt || ''
    const newPrompt = currentPrompt ? `${currentPrompt}, ${tip}` : tip
    handlePromptChange(newPrompt)
    promptTextareaRef.current.focus()
  }

  const handlePlacementChange = (
    field: 'scale' | 'x' | 'y' | 'rotation',
    value: number | number[]
  ) => {
    if (!selected || selected.kind !== 'scene') return

    const numValue = Array.isArray(value) ? value[0] : value
    const composition = projectLabState.sceneCompositions[selected.sceneId] || {
      characterIds: [],
      propIds: [],
    }
    const placements = composition.placements || {}
    const assetKey = `${selected.assetRef.categoryId}-${selected.assetRef.slotId}`
    const currentPlacement = placements[assetKey] || {}

    const updatedCompositions = {
      ...projectLabState.sceneCompositions,
      [selected.sceneId]: {
        ...composition,
        placements: {
          ...placements,
          [assetKey]: {
            ...currentPlacement,
            [field]: numValue,
          },
        },
      },
    }

    onUpdateState({ sceneCompositions: updatedCompositions })
  }

  const getPlacement = () => {
    if (!selected || selected.kind !== 'scene') return null
    const composition = projectLabState.sceneCompositions[selected.sceneId]
    if (!composition?.placements) return null
    const assetKey = `${selected.assetRef.categoryId}-${selected.assetRef.slotId}`
    return composition.placements[assetKey] || null
  }

  const placement = getPlacement()

  if (!selected || !slot) {
    return (
      <div className="h-full flex flex-col p-4 overflow-auto">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-[#00ffea]" />
          <h2 className="text-lg font-semibold text-white">Inspector</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/60">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No item selected</p>
            <p className="text-xs mt-1">Click a slot or scene asset to inspect</p>
          </div>
        </div>
      </div>
    )
  }

  const isLocked = slot.status === 'locked'
  const tips = category ? studioTips[category] : []

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-5 w-5 text-[#00ffea]" />
          <h2 className="text-lg font-semibold text-white">Inspector</h2>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate">{slot.title}</h3>
            <Badge
              variant="outline"
              className={cn(
                'mt-1 text-xs',
                category
                  ? 'bg-[#00ffea]/10 text-[#00ffea] border-[#00ffea]/30'
                  : 'bg-white/5 text-white/60 border-white/10'
              )}
            >
              {category ? categoryLabels[category] : 'Unknown'}
            </Badge>
          </div>
          <Badge
            className={cn(
              'text-xs border shrink-0',
              slot.status === 'empty'
                ? 'bg-white/10 text-white/60 border-white/10'
                : slot.status === 'draft'
                ? 'bg-[#00ffea]/20 text-[#00ffea] border-[#00ffea]/30'
                : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            )}
          >
            {slot.status === 'empty' ? 'Empty' : slot.status === 'draft' ? 'Draft' : 'Locked'}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1 mt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleFocus}
            className="h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
          >
            <Focus className="h-3 w-3 mr-1" />
            Focus
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDuplicate}
            className="h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
          >
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Prompt Editor */}
        <Card className={cn('bg-[#0a0f15]/80 backdrop-blur-sm border border-white/10')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white/80">Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Textarea
                ref={promptTextareaRef}
                value={slot.prompt || ''}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="Enter prompt..."
                disabled={isLocked}
                className={cn(
                  'min-h-[100px] bg-[#07090a] border-white/10 text-white placeholder:text-white/40',
                  isLocked && 'opacity-50 cursor-not-allowed'
                )}
              />
              {!isLocked && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRevert}
                  className="mt-2 h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Revert
                </Button>
              )}
            </div>

            {/* Negative Prompt (Collapsible) */}
            <div>
              <button
                onClick={() => setShowNegativePrompt(!showNegativePrompt)}
                className="flex items-center gap-2 text-xs text-white/60 hover:text-white/80 transition-colors"
              >
                {showNegativePrompt ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                <span>Negative Prompt</span>
              </button>
              {showNegativePrompt && (
                <Textarea
                  value={slot.negativePrompt || ''}
                  onChange={(e) => handleNegativePromptChange(e.target.value)}
                  placeholder="Enter negative prompt..."
                  disabled={isLocked}
                  className={cn(
                    'mt-2 min-h-[60px] bg-[#07090a] border-white/10 text-white placeholder:text-white/40',
                    isLocked && 'opacity-50 cursor-not-allowed'
                  )}
                />
              )}
            </div>

            {/* Seed */}
            <div>
              <Label className="text-xs text-white/60">Seed (optional)</Label>
              <Input
                type="number"
                value={slot.seed || ''}
                onChange={(e) => handleSeedChange(e.target.value)}
                placeholder="Auto"
                disabled={isLocked}
                className={cn(
                  'mt-1 bg-[#07090a] border-white/10 text-white',
                  isLocked && 'opacity-50 cursor-not-allowed'
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Style Locks */}
        <Card className={cn('bg-[#0a0f15]/80 backdrop-blur-sm border border-white/10')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white/80">Style Locks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-white/80">Lock Color Palette</Label>
              <Switch
                checked={slot.locks?.palette || false}
                onCheckedChange={() => handleLockToggle('palette')}
                disabled={isLocked}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-white/80">Lock Line Weight</Label>
              <Switch
                checked={slot.locks?.line || false}
                onCheckedChange={() => handleLockToggle('line')}
                disabled={isLocked}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-white/80">Lock Outfit</Label>
              <Switch
                checked={slot.locks?.outfit || false}
                onCheckedChange={() => handleLockToggle('outfit')}
                disabled={isLocked}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-white/80">Lock Face</Label>
              <Switch
                checked={slot.locks?.face || false}
                onCheckedChange={() => handleLockToggle('face')}
                disabled={isLocked}
              />
            </div>
          </CardContent>
        </Card>

        {/* Voice Assignment (Characters only) */}
        {category === 'characters' && (
          <Card className={cn('bg-[#0a0f15]/80 backdrop-blur-sm border border-white/10')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white/80">Voice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={slot.voiceId || ''}
                onValueChange={handleVoiceChange}
                disabled={isLocked}
              >
                <SelectTrigger
                  className={cn(
                    'bg-[#07090a] border-white/10 text-white',
                    isLocked && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info('Preview (mock)')}
                className="w-full text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Placement (Scene assets only) */}
        {selected.kind === 'scene' && (
          <Card className={cn('bg-[#0a0f15]/80 backdrop-blur-sm border border-white/10')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white/80">Placement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-white/60 mb-2 block">Scale</Label>
                <Slider
                  value={[placement?.scale || 100]}
                  onValueChange={(v) => handlePlacementChange('scale', v)}
                  min={50}
                  max={200}
                  step={1}
                  className="mb-2"
                />
                <div className="text-xs text-white/60 text-right">{placement?.scale || 100}%</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-white/60 mb-1 block">X</Label>
                  <Input
                    type="number"
                    value={placement?.x || 0}
                    onChange={(e) => handlePlacementChange('x', parseInt(e.target.value, 10) || 0)}
                    className="bg-[#07090a] border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-white/60 mb-1 block">Y</Label>
                  <Input
                    type="number"
                    value={placement?.y || 0}
                    onChange={(e) => handlePlacementChange('y', parseInt(e.target.value, 10) || 0)}
                    className="bg-[#07090a] border-white/10 text-white text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-white/60 mb-2 block">Rotation</Label>
                <Slider
                  value={[placement?.rotation || 0]}
                  onValueChange={(v) => handlePlacementChange('rotation', v)}
                  min={-180}
                  max={180}
                  step={1}
                  className="mb-2"
                />
                <div className="text-xs text-white/60 text-right">{placement?.rotation || 0}°</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate / Approve Flow */}
        <Card className={cn('bg-[#0a0f15]/80 backdrop-blur-sm border border-white/10')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white/80">Actions</CardTitle>
          </CardHeader>
          <CardContent ref={actionsRef} className="space-y-2">
            <Button
              onClick={handleGeneratePreview}
              disabled={isLocked}
              className={cn(
                'w-full bg-[#00ffea] hover:bg-[#00e6d1] text-black font-semibold',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Preview
            </Button>
            {slot.status === 'draft' && (
              <Button
                onClick={handleLock}
                variant="outline"
                className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Lock className="h-4 w-4 mr-2" />
                Approve / Lock
              </Button>
            )}
            {slot.status === 'locked' && (
              <Button
                onClick={handleUnlock}
                variant="outline"
                className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Unlock
              </Button>
            )}
            {slot.usage?.previewRerolls !== undefined && slot.usage.previewRerolls > 0 && (
              <div className="text-xs text-white/40 text-center pt-1">
                Rerolls: {slot.usage.previewRerolls}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Studio Tips */}
        {tips.length > 0 && (
          <Card className={cn('bg-[#0a0f15]/80 backdrop-blur-sm border border-white/10')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white/80">Studio Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tips.map((tip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTipClick(tip)}
                    disabled={isLocked}
                    className={cn(
                      'px-2 py-1 rounded text-xs border transition-colors',
                      'bg-white/5 text-white/70 border-white/10',
                      'hover:bg-[#00ffea]/10 hover:text-[#00ffea] hover:border-[#00ffea]/30',
                      isLocked && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

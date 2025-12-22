'use client'

import { useState } from 'react'
import { Users, MapPin, Package, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ProjectLabState, SlotItem, SceneComposition, SelectedTarget } from '@/lib/demo/projectLabTypes'

interface BuildModeContentProps {
  projectLabState: ProjectLabState
  onUpdateState: (updates: Partial<ProjectLabState>) => void
  selected: SelectedTarget
  onSelect: (target: SelectedTarget) => void
}

export default function BuildModeContent({
  projectLabState,
  onUpdateState,
  selected,
  onSelect,
}: BuildModeContentProps) {
  const [draggedItem, setDraggedItem] = useState<{ id: string; category: string } | null>(null)
  const [hoveredScene, setHoveredScene] = useState<string | null>(null)

  const scenes = projectLabState.categories.scenes
  const characters = projectLabState.categories.characters.filter((c) => c.status !== 'empty')
  const locations = projectLabState.categories.locations.filter((l) => l.status !== 'empty')
  const props = projectLabState.categories.props.filter((p) => p.status !== 'empty')

  const handleDragStart = (e: React.DragEvent, itemId: string, category: string) => {
    setDraggedItem({ id: itemId, category })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, sceneId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setHoveredScene(sceneId)
  }

  const handleDragLeave = () => {
    setHoveredScene(null)
  }

  const handleDrop = (e: React.DragEvent, sceneId: string) => {
    e.preventDefault()
    setHoveredScene(null)

    if (!draggedItem) return

    const currentComposition = projectLabState.sceneCompositions[sceneId] || {
      characterIds: [],
      propIds: [],
    }

    let updatedComposition: SceneComposition = { ...currentComposition }

    if (draggedItem.category === 'characters') {
      if (!updatedComposition.characterIds.includes(draggedItem.id)) {
        updatedComposition.characterIds = [...updatedComposition.characterIds, draggedItem.id]
      }
    } else if (draggedItem.category === 'locations') {
      updatedComposition.locationId = draggedItem.id
    } else if (draggedItem.category === 'props') {
      if (!updatedComposition.propIds.includes(draggedItem.id)) {
        updatedComposition.propIds = [...updatedComposition.propIds, draggedItem.id]
      }
    }

    onUpdateState({
      sceneCompositions: {
        ...projectLabState.sceneCompositions,
        [sceneId]: updatedComposition,
      },
    })

    setDraggedItem(null)
  }

  const handleClickAdd = (itemId: string, category: string, sceneId: string) => {
    const currentComposition = projectLabState.sceneCompositions[sceneId] || {
      characterIds: [],
      propIds: [],
    }

    let updatedComposition: SceneComposition = { ...currentComposition }

    if (category === 'characters') {
      if (!updatedComposition.characterIds.includes(itemId)) {
        updatedComposition.characterIds = [...updatedComposition.characterIds, itemId]
      }
    } else if (category === 'locations') {
      updatedComposition.locationId = itemId
    } else if (category === 'props') {
      if (!updatedComposition.propIds.includes(itemId)) {
        updatedComposition.propIds = [...updatedComposition.propIds, itemId]
      }
    }

    onUpdateState({
      sceneCompositions: {
        ...projectLabState.sceneCompositions,
        [sceneId]: updatedComposition,
      },
    })
  }

  const handleRemoveAsset = (sceneId: string, type: 'character' | 'location' | 'prop', assetId: string) => {
    const currentComposition = projectLabState.sceneCompositions[sceneId]
    if (!currentComposition) return

    let updatedComposition: SceneComposition = { ...currentComposition }

    if (type === 'character') {
      updatedComposition.characterIds = updatedComposition.characterIds.filter((id) => id !== assetId)
    } else if (type === 'location') {
      updatedComposition.locationId = undefined
    } else if (type === 'prop') {
      updatedComposition.propIds = updatedComposition.propIds.filter((id) => id !== assetId)
    }

    onUpdateState({
      sceneCompositions: {
        ...projectLabState.sceneCompositions,
        [sceneId]: updatedComposition,
      },
    })
  }

  const getAssetById = (id: string, category: 'characters' | 'locations' | 'props'): SlotItem | undefined => {
    return projectLabState.categories[category].find((item) => item.id === id)
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      {/* Available Assets */}
      <div className="flex-shrink-0">
        <h3 className="text-sm font-medium text-white/80 mb-3">Available Assets</h3>
        <div className="grid grid-cols-3 gap-2">
          {/* Characters */}
          {characters.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-[#0a0f15]/50 p-2">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-[#00ffea]" />
                <span className="text-xs text-white/60">Characters</span>
              </div>
              <div className="space-y-1">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, char.id, 'characters')}
                    className="p-1.5 rounded bg-[#07090a] border border-white/5 text-xs text-white/80 cursor-move hover:border-[#00ffea]/30 transition-colors"
                  >
                    {char.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locations */}
          {locations.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-[#0a0f15]/50 p-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-[#00ffea]" />
                <span className="text-xs text-white/60">Locations</span>
              </div>
              <div className="space-y-1">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, loc.id, 'locations')}
                    className="p-1.5 rounded bg-[#07090a] border border-white/5 text-xs text-white/80 cursor-move hover:border-[#00ffea]/30 transition-colors"
                  >
                    {loc.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Props */}
          {props.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-[#0a0f15]/50 p-2">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-[#00ffea]" />
                <span className="text-xs text-white/60">Props</span>
              </div>
              <div className="space-y-1">
                {props.map((prop) => (
                  <div
                    key={prop.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, prop.id, 'props')}
                    className="p-1.5 rounded bg-[#07090a] border border-white/5 text-xs text-white/80 cursor-move hover:border-[#00ffea]/30 transition-colors"
                  >
                    {prop.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scene Slots */}
      <div className="flex-1 min-h-0 overflow-auto">
        <h3 className="text-sm font-medium text-white/80 mb-3">Scene Composition</h3>
        <div className="space-y-3">
          {scenes.map((scene) => {
            const composition = projectLabState.sceneCompositions[scene.id] || {
              characterIds: [],
              propIds: [],
            }
            const isHovered = hoveredScene === scene.id

            return (
              <div
                key={scene.id}
                onDragOver={(e) => handleDragOver(e, scene.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, scene.id)}
                className={cn(
                  'rounded-lg border p-3 transition-all',
                  isHovered
                    ? 'border-[#00ffea] bg-[#00ffea]/10'
                    : 'border-white/10 bg-[#0a0f15]/50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">{scene.title}</h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      scene.status === 'locked'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'bg-white/5 text-white/60 border-white/10'
                    )}
                  >
                    {scene.status === 'locked' ? 'Locked' : 'Draft'}
                  </Badge>
                </div>

                {/* Composition Display */}
                <div className="space-y-2 mt-3">
                  {/* Characters */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-3 w-3 text-white/60" />
                      <span className="text-xs text-white/60">Characters</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {composition.characterIds.map((charId) => {
                        const char = getAssetById(charId, 'characters')
                        const isSelected =
                          selected?.kind === 'scene' &&
                          selected.sceneId === scene.id &&
                          selected.assetRef.categoryId === 'characters' &&
                          selected.assetRef.slotId === charId
                        return char ? (
                          <Badge
                            key={charId}
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelect({
                                kind: 'scene',
                                sceneId: scene.id,
                                assetRef: { categoryId: 'characters', slotId: charId },
                              })
                            }}
                            className={cn(
                              'bg-[#00ffea]/20 text-[#00ffea] border-[#00ffea]/30 text-xs cursor-pointer transition-all',
                              isSelected &&
                                'ring-2 ring-[#00ffea] shadow-[0_0_10px_rgba(0,255,234,0.5)]'
                            )}
                          >
                            {char.title}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveAsset(scene.id, 'character', charId)
                              }}
                              className="ml-1 hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null
                      })}
                      {composition.characterIds.length === 0 && (
                        <span className="text-xs text-white/40">Drop or click to add characters</span>
                      )}
                    </div>
                    {/* Click-to-add buttons */}
                    {characters.map((char) => (
                      <Button
                        key={char.id}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleClickAdd(char.id, 'characters', scene.id)}
                        disabled={composition.characterIds.includes(char.id)}
                        className="h-6 px-2 text-xs mr-1 mt-1"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {char.title}
                      </Button>
                    ))}
                  </div>

                  {/* Location */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-3 w-3 text-white/60" />
                      <span className="text-xs text-white/60">Location</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {composition.locationId ? (
                        (() => {
                          const loc = getAssetById(composition.locationId, 'locations')
                          const isSelected =
                            selected?.kind === 'scene' &&
                            selected.sceneId === scene.id &&
                            selected.assetRef.categoryId === 'locations' &&
                            selected.assetRef.slotId === composition.locationId
                          return loc ? (
                            <Badge
                              onClick={(e) => {
                                e.stopPropagation()
                                onSelect({
                                  kind: 'scene',
                                  sceneId: scene.id,
                                  assetRef: { categoryId: 'locations', slotId: composition.locationId! },
                                })
                              }}
                              className={cn(
                                'bg-[#00ffea]/20 text-[#00ffea] border-[#00ffea]/30 text-xs cursor-pointer transition-all',
                                isSelected &&
                                  'ring-2 ring-[#00ffea] shadow-[0_0_10px_rgba(0,255,234,0.5)]'
                              )}
                            >
                              {loc.title}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveAsset(scene.id, 'location', composition.locationId!)
                                }}
                                className="ml-1 hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ) : null
                        })()
                      ) : (
                        <span className="text-xs text-white/40">Drop or click to add location</span>
                      )}
                    </div>
                    {/* Click-to-add buttons */}
                    {locations.map((loc) => (
                      <Button
                        key={loc.id}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleClickAdd(loc.id, 'locations', scene.id)}
                        disabled={composition.locationId === loc.id}
                        className="h-6 px-2 text-xs mr-1 mt-1"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {loc.title}
                      </Button>
                    ))}
                  </div>

                  {/* Props */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-3 w-3 text-white/60" />
                      <span className="text-xs text-white/60">Props</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {composition.propIds.map((propId) => {
                        const prop = getAssetById(propId, 'props')
                        const isSelected =
                          selected?.kind === 'scene' &&
                          selected.sceneId === scene.id &&
                          selected.assetRef.categoryId === 'props' &&
                          selected.assetRef.slotId === propId
                        return prop ? (
                          <Badge
                            key={propId}
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelect({
                                kind: 'scene',
                                sceneId: scene.id,
                                assetRef: { categoryId: 'props', slotId: propId },
                              })
                            }}
                            className={cn(
                              'bg-[#00ffea]/20 text-[#00ffea] border-[#00ffea]/30 text-xs cursor-pointer transition-all',
                              isSelected &&
                                'ring-2 ring-[#00ffea] shadow-[0_0_10px_rgba(0,255,234,0.5)]'
                            )}
                          >
                            {prop.title}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveAsset(scene.id, 'prop', propId)
                              }}
                              className="ml-1 hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null
                      })}
                      {composition.propIds.length === 0 && (
                        <span className="text-xs text-white/40">Drop or click to add props</span>
                      )}
                    </div>
                    {/* Click-to-add buttons */}
                    {props.map((prop) => (
                      <Button
                        key={prop.id}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleClickAdd(prop.id, 'props', scene.id)}
                        disabled={composition.propIds.includes(prop.id)}
                        className="h-6 px-2 text-xs mr-1 mt-1"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {prop.title}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


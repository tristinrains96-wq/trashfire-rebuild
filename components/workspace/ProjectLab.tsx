'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Edit, Lock, Unlock, Users, MapPin, Package, Film, Mic, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ProjectLabState, SlotItem, SlotCategory } from '@/lib/demo/projectLabTypes'
import SlotEditModal from './SlotEditModal'

interface ProjectLabProps {
  projectLabState: ProjectLabState
  onUpdateState: (updates: Partial<ProjectLabState>) => void
}

const categoryIcons: Record<SlotCategory, typeof Users> = {
  characters: Users,
  locations: MapPin,
  props: Package,
  scenes: Film,
  voices: Mic,
  episode: BookOpen,
}

const categoryLabels: Record<SlotCategory, string> = {
  characters: 'Characters',
  locations: 'Locations',
  props: 'Props',
  scenes: 'Scenes',
  voices: 'Voices',
  episode: 'Episode',
}

export default function ProjectLab({ projectLabState, onUpdateState }: ProjectLabProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<SlotCategory>>(
    new Set<SlotCategory>(['characters', 'scenes'])
  )
  const [editingSlot, setEditingSlot] = useState<SlotItem | null>(null)

  const toggleCategory = (category: SlotCategory) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleEditSlot = (slot: SlotItem) => {
    setEditingSlot(slot)
  }

  const handleSaveSlot = (slotId: string, prompt: string) => {
    const updatedCategories = { ...projectLabState.categories }
    let found = false

    for (const category of Object.keys(updatedCategories) as SlotCategory[]) {
      const slots = updatedCategories[category]
      const slotIndex = slots.findIndex((s) => s.id === slotId)
      if (slotIndex !== -1) {
        slots[slotIndex] = { ...slots[slotIndex], prompt, status: 'draft' as const }
        found = true
        break
      }
    }

    if (found) {
      onUpdateState({ categories: updatedCategories })
    }
  }

  const handleLockSlot = (slotId: string) => {
    const updatedCategories = { ...projectLabState.categories }
    let found = false

    for (const category of Object.keys(updatedCategories) as SlotCategory[]) {
      const slots = updatedCategories[category]
      const slotIndex = slots.findIndex((s) => s.id === slotId)
      if (slotIndex !== -1 && slots[slotIndex].status === 'draft') {
        slots[slotIndex] = { ...slots[slotIndex], status: 'locked' as const }
        found = true
        break
      }
    }

    if (found) {
      onUpdateState({ categories: updatedCategories })
    }
  }

  const handleUnlockSlot = (slotId: string) => {
    const updatedCategories = { ...projectLabState.categories }
    let found = false

    for (const category of Object.keys(updatedCategories) as SlotCategory[]) {
      const slots = updatedCategories[category]
      const slotIndex = slots.findIndex((s) => s.id === slotId)
      if (slotIndex !== -1 && slots[slotIndex].status === 'locked') {
        slots[slotIndex] = { ...slots[slotIndex], status: 'draft' as const }
        found = true
        break
      }
    }

    if (found) {
      onUpdateState({ categories: updatedCategories })
    }
  }

  const getStatusColor = (status: SlotItem['status']) => {
    switch (status) {
      case 'empty':
        return 'bg-white/10 text-white/60'
      case 'draft':
        return 'bg-[#00ffea]/20 text-[#00ffea] border-[#00ffea]/30'
      case 'locked':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-white/10 text-white/60'
    }
  }

  const getStatusLabel = (status: SlotItem['status']) => {
    switch (status) {
      case 'empty':
        return 'Empty'
      case 'draft':
        return 'Draft'
      case 'locked':
        return 'Locked'
      default:
        return 'Empty'
    }
  }

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="h-5 w-5 rounded bg-gradient-to-br from-[#00ffea] to-[#00e6d1] flex items-center justify-center">
          <div className="h-3 w-3 rounded-sm bg-black/20" />
        </div>
        <h2 className="text-lg font-semibold text-white">Project Lab</h2>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-auto space-y-2">
        {(Object.keys(projectLabState.categories) as SlotCategory[]).map((category) => {
          const Icon = categoryIcons[category]
          const slots = projectLabState.categories[category]
          const isExpanded = expandedCategories.has(category)
          const completedCount = slots.filter((s) => s.status !== 'empty').length
          const totalCount = slots.length

          return (
            <div
              key={category}
              className={cn(
                'rounded-lg border border-white/10',
                'bg-[#07090a]/50 backdrop-blur-sm',
                'overflow-hidden'
              )}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  'w-full flex items-center justify-between p-3',
                  'hover:bg-white/5 transition-colors',
                  'text-left'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#00ffea]" />
                  <span className="text-sm font-medium text-white">{categoryLabels[category]}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      completedCount === totalCount
                        ? 'bg-[#00ffea]/20 text-[#00ffea] border-[#00ffea]/30'
                        : 'bg-white/5 text-white/60 border-white/10'
                    )}
                  >
                    {completedCount}/{totalCount}
                  </Badge>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-white/60 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              {/* Category Slots */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-2">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={cn(
                            'p-2 rounded border',
                            'bg-[#0a0f15]/80',
                            slot.status === 'empty'
                              ? 'border-white/10'
                              : slot.status === 'draft'
                              ? 'border-[#00ffea]/30'
                              : 'border-purple-500/30'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white truncate">
                                {slot.title}
                              </h4>
                              {slot.prompt && (
                                <p className="text-xs text-white/60 mt-1 line-clamp-2">
                                  {slot.prompt}
                                </p>
                              )}
                            </div>
                            <Badge
                              className={cn(
                                'text-xs shrink-0',
                                getStatusColor(slot.status),
                                'border'
                              )}
                            >
                              {getStatusLabel(slot.status)}
                            </Badge>
                          </div>

                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditSlot(slot)}
                              className="h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            {slot.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleLockSlot(slot.id)}
                                className="h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
                              >
                                <Lock className="h-3 w-3 mr-1" />
                                Lock
                              </Button>
                            )}
                            {slot.status === 'locked' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUnlockSlot(slot.id)}
                                className="h-7 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
                              >
                                <Unlock className="h-3 w-3 mr-1" />
                                Unlock
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      <SlotEditModal
        isOpen={!!editingSlot}
        slot={editingSlot}
        onClose={() => setEditingSlot(null)}
        onSave={handleSaveSlot}
      />
    </div>
  )
}


'use client'

import { Play, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ProjectLabState, SelectedTarget } from '@/lib/demo/projectLabTypes'

interface PreviewModeContentProps {
  projectLabState: ProjectLabState
  selected: SelectedTarget
  onSelect: (target: SelectedTarget) => void
}

export default function PreviewModeContent({
  projectLabState,
  selected,
  onSelect,
}: PreviewModeContentProps) {
  const scenes = projectLabState.categories.scenes
  const compositions = projectLabState.sceneCompositions

  // Mock preview data
  const getScenePreview = (sceneId: string) => {
    const composition = compositions[sceneId]
    if (!composition) {
      return {
        thumbnail: '🎬',
        duration: '0:00',
        hasAssets: false,
      }
    }

    const hasAssets =
      composition.characterIds.length > 0 || composition.locationId || composition.propIds.length > 0

    return {
      thumbnail: hasAssets ? '✨' : '🎬',
      duration: '0:30',
      hasAssets,
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      {/* Episode Preview Header */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Episode Preview</h2>
          <p className="text-sm text-white/60">Mock preview of composed scenes</p>
        </div>
        <Badge className="bg-[#00ffea]/20 text-[#00ffea] border-[#00ffea]/30">Preview Mode</Badge>
      </div>

      {/* Scene Cards Sequence */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="space-y-3">
          {scenes.map((scene, index) => {
            const preview = getScenePreview(scene.id)
            const composition = compositions[scene.id]
            const isLocked = scene.status === 'locked'

            return (
              <div
                key={scene.id}
                className={cn(
                  'rounded-lg border p-4',
                  isLocked
                    ? 'border-purple-500/30 bg-purple-500/10'
                    : 'border-white/10 bg-[#0a0f15]/50'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Scene Number */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#00ffea]/20 flex items-center justify-center border border-[#00ffea]/30">
                    <span className="text-lg font-bold text-[#00ffea]">{index + 1}</span>
                  </div>

                  {/* Scene Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-white">{scene.title}</h3>
                      <div className="flex items-center gap-2">
                        {isLocked && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                        <span className="text-xs text-white/60">{preview.duration}</span>
                      </div>
                    </div>

                    {/* Composition Summary */}
                    {composition && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {composition.characterIds.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-white/5 text-white/60 border-white/10">
                            {composition.characterIds.length} character{composition.characterIds.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {composition.locationId && (
                          <Badge variant="outline" className="text-xs bg-white/5 text-white/60 border-white/10">
                            Location
                          </Badge>
                        )}
                        {composition.propIds.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-white/5 text-white/60 border-white/10">
                            {composition.propIds.length} prop{composition.propIds.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {!preview.hasAssets && (
                          <Badge variant="outline" className="text-xs bg-white/5 text-white/40 border-white/10">
                            No assets
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Preview Thumbnail */}
                  <div className="flex-shrink-0 w-24 h-16 rounded border border-white/10 bg-[#07090a] flex items-center justify-center text-2xl">
                    {preview.thumbnail}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mock Player */}
      <div className="flex-shrink-0 rounded-lg border border-white/10 bg-[#0a0f15]/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 rounded-full bg-[#00ffea]/20 border border-[#00ffea]/30 flex items-center justify-center hover:bg-[#00ffea]/30 transition-colors">
              <Play className="h-6 w-6 text-[#00ffea]" />
            </button>
            <div>
              <p className="text-sm font-medium text-white">Episode Preview</p>
              <p className="text-xs text-white/60">Mock player - video playback would appear here</p>
            </div>
          </div>
          <div className="text-xs text-white/40">
            {scenes.length} scene{scenes.length !== 1 ? 's' : ''} • ~2:00 total
          </div>
        </div>
      </div>
    </div>
  )
}


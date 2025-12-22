'use client'

import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ProjectLabState } from '@/lib/demo/projectLabTypes'

interface PlanModeContentProps {
  projectLabState: ProjectLabState
  onUpdateState: (updates: Partial<ProjectLabState>) => void
}

export default function PlanModeContent({ projectLabState, onUpdateState }: PlanModeContentProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      {/* Script Editor - Emphasized */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white/80">Script</label>
          <span className="text-xs text-[#00ffea]">Plan Mode</span>
        </div>
        <Textarea
          value={projectLabState.scriptText}
          onChange={(e) => onUpdateState({ scriptText: e.target.value })}
          placeholder="Write your script here... (at least 30 characters to enable scene plan generation)"
          className={cn(
            'flex-1 min-h-[300px] bg-[#0a0f15]/50 backdrop-blur-sm',
            'border-white/10 text-white placeholder:text-white/40',
            'focus:border-[#00ffea] focus:ring-[#00ffea]/20',
            'resize-none'
          )}
        />
      </div>

      {/* Scene Plan Display - Emphasized */}
      {projectLabState.scenePlanText ? (
        <div className="flex-1 min-h-0 flex flex-col">
          <label className="text-sm font-medium text-white/80 mb-2">Scene Plan</label>
          <Textarea
            value={projectLabState.scenePlanText}
            readOnly
            className={cn(
              'flex-1 min-h-[300px] bg-[#0a0f15]/50 backdrop-blur-sm',
              'border-white/10 text-white/80',
              'resize-none'
            )}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center rounded-lg border border-white/10 bg-[#0a0f15]/50 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-white/60 mb-2">Scene Plan</p>
            <p className="text-sm text-white/40">Write your script to generate a scene plan</p>
          </div>
        </div>
      )}
    </div>
  )
}


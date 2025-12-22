'use client'

import { useState, useEffect } from 'react'
import { FileText, Hammer, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export type WorkspaceMode = 'plan' | 'build' | 'preview'

interface ModeSwitcherProps {
  mode: WorkspaceMode
  onModeChange: (mode: WorkspaceMode) => void
}

const modes: { id: WorkspaceMode; label: string; icon: typeof FileText }[] = [
  { id: 'plan', label: 'Plan', icon: FileText },
  { id: 'build', label: 'Build', icon: Hammer },
  { id: 'preview', label: 'Preview', icon: Play },
]

export default function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0a0f15]/50 border border-white/10">
      {modes.map((m) => {
        const Icon = m.icon
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              'hover:bg-white/5',
              mode === m.id
                ? 'bg-[#00ffea]/20 text-[#00ffea] shadow-[0_0_10px_rgba(0,255,234,0.3)]'
                : 'text-white/60 hover:text-white/80'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}


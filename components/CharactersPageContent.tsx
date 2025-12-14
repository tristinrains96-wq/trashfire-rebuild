'use client'

import CharactersPanel from '@/components/panels/CharactersPanel'
import { useScriptPlan } from '@/hooks/useScriptPlan'

export default function CharactersPageContent() {
  const { nextNeeded } = useScriptPlan()

  return (
    <div className="space-y-6">
      {/* Plan hint */}
      {nextNeeded.characters > 0 && (
        <div className="mx-4 p-3 bg-teal-900/20 border border-teal-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
            <span className="text-sm text-teal-200">
              From Script: {nextNeeded.characters} {nextNeeded.characters === 1 ? 'character' : 'characters'} to create
            </span>
          </div>
        </div>
      )}
      
      <CharactersPanel />
    </div>
  )
}

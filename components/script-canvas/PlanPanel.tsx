'use client'

import { useScriptLabStore } from '@/store/scriptLab'
import { PlanCharacter, PlanLocation, PlanScene } from '@/store/scriptLab'

interface PlanPanelProps {
  className?: string
}

export default function PlanPanel({ className = '' }: PlanPanelProps) {
  const { plan, planStatus } = useScriptLabStore()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'ring-teal-500/40 text-teal-200'
      case 'needs-design':
      case 'needs-voice':
      case 'needs-bg':
        return 'ring-rose-500/40 text-rose-200'
      default:
        return 'ring-gray-500/40 text-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Ready'
      case 'needs-design':
        return 'Needs design'
      case 'needs-voice':
        return 'Needs voice'
      case 'needs-bg':
        return 'Needs background'
      default:
        return status
    }
  }

  const needsCount = plan.characters.filter(c => c.status !== 'ready').length + 
                   plan.locations.filter(l => l.status !== 'ready').length

  return (
    <div className={`rounded-2xl border border-teal-900/30 bg-[#0b0e10]/60 p-4 gap-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Plan</h3>
        {needsCount > 0 && (
          <div className="text-sm text-rose-200">
            We&apos;ll need {needsCount} {needsCount === 1 ? 'asset' : 'assets'} to continue.
          </div>
        )}
      </div>

      {/* Characters Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Characters</h4>
        <div className="flex flex-wrap gap-2">
          {plan.characters.length === 0 ? (
            <span className="text-sm text-gray-400">No characters detected</span>
          ) : (
            plan.characters.map((character, index) => (
              <div
                key={index}
                className={`px-3 py-1 rounded-full text-xs ring-1 ${getStatusColor(character.status)}`}
              >
                {character.name} - {getStatusLabel(character.status)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Locations Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Locations</h4>
        <div className="flex flex-wrap gap-2">
          {plan.locations.length === 0 ? (
            <span className="text-sm text-gray-400">No locations detected</span>
          ) : (
            plan.locations.map((location, index) => (
              <div
                key={index}
                className={`px-3 py-1 rounded-full text-xs ring-1 ${getStatusColor(location.status)}`}
              >
                {location.name} - {getStatusLabel(location.status)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Scenes Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Scenes</h4>
        <div className="space-y-2">
          {plan.scenes.length === 0 ? (
            <span className="text-sm text-gray-400">No scenes detected</span>
          ) : (
            plan.scenes.map((scene, index) => (
              <div key={index} className="text-sm text-gray-300">
                <span className="font-medium">Scene {scene.number}:</span> {scene.oneLiner}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useScriptPlan } from '@/hooks/useScriptPlan'

export default function BackgroundsPageContent() {
  const { nextNeeded } = useScriptPlan()

  return (
    <div className="space-y-6">
      {/* Plan hint */}
      {nextNeeded.locations > 0 && (
        <div className="mx-4 p-3 bg-teal-900/20 border border-teal-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
            <span className="text-sm text-teal-200">
              From Script: {nextNeeded.locations} {nextNeeded.locations === 1 ? 'background' : 'backgrounds'} to create
            </span>
          </div>
        </div>
      )}
      
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Backgrounds</h2>
        <p className="text-text-secondary">Browse and select background environments</p>
      </div>
      {/* Background grid will be rendered here */}
    </div>
  )
}

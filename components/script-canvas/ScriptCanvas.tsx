'use client'

import { useScriptLabStore } from '@/store/scriptLab'
import CanvasHeader from './CanvasHeader'
import CanvasBody from './CanvasBody'
import CanvasSidebar from './CanvasSidebar'
import CanvasFooter from './CanvasFooter'
import PlanPanel from './PlanPanel'
import AdaptiveButton from './AdaptiveButton'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function ScriptCanvas() {
  const { alerts, nextActions, showAdvanced, setShowAdvanced } = useScriptLabStore()
  const [showAdvancedToggle, setShowAdvancedToggle] = useState(false)

  return (
    <div className="h-[50vh] md:h-[58vh] overflow-auto pr-2">
      <div className="w-full h-full bg-background border border-teal-500/20 rounded-lg overflow-hidden shadow-lg shadow-teal-500/10">
        {/* Header with tabs - only show Chat by default */}
        <CanvasHeader />
        
        {/* Advanced toggle */}
        <div className="px-4 py-2 border-b border-teal-500/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-400 hover:text-teal-300 hover:bg-teal-600/10"
          >
            {showAdvanced ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            Advanced
          </Button>
        </div>
        
        {/* Main content area */}
        <div className="flex flex-1 h-full">
          {/* Chat and Plan layout */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
            {/* Chat area */}
            <div className="flex-1 min-h-0">
              <CanvasBody />
            </div>
            
            {/* Plan panel - right side on desktop, below chat on mobile */}
            <div className="lg:w-80 w-full">
              <PlanPanel />
            </div>
          </div>
          
          {/* Sidebar for alerts (hidden when empty) */}
          {alerts.length > 0 && (
            <div className="hidden lg:block">
              <CanvasSidebar />
            </div>
          )}
        </div>
        
        {/* Mobile sidebar overlay */}
        {alerts.length > 0 && (
          <div className="lg:hidden">
            <CanvasSidebar />
          </div>
        )}
        
        {/* Adaptive button - sticky below chat input */}
        <div className="p-4 border-t border-teal-500/20">
          <AdaptiveButton />
        </div>
        
        {/* Footer with next actions */}
        {nextActions.length > 0 && (
          <CanvasFooter />
        )}
      </div>
    </div>
  )
}

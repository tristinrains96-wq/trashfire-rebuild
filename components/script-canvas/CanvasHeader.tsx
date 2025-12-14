'use client'

import { useScriptLabStore } from '@/store/scriptLab'
import { Button } from '@/components/ui/button'

const VIEW_TABS = [
  { key: 'chat', label: 'Chat' },
  { key: 'outline', label: 'Outline' },
  { key: 'beats', label: 'Beat Sheet' },
  { key: 'scenes', label: 'Scene Cards' },
  { key: 'draft', label: 'Draft' }
] as const

const EXPERT_TABS = VIEW_TABS.filter(tab => tab.key !== 'chat')

export default function CanvasHeader() {
  const { activeView, setActiveView, showAdvanced } = useScriptLabStore()

  return (
    <div className="border-b border-teal-500/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4">
        {/* View Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Always show Chat tab */}
          <Button
            key="chat"
            variant={activeView === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('chat')}
            className={`${
              activeView === 'chat'
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/25'
                : 'text-gray-400 hover:text-teal-300 hover:bg-teal-600/10'
            } transition-all duration-200 whitespace-nowrap`}
          >
            Chat
          </Button>
          
          {/* Show expert tabs only when Advanced is open */}
          {showAdvanced && EXPERT_TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeView === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView(tab.key)}
              className={`${
                activeView === tab.key
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/25'
                  : 'text-gray-400 hover:text-teal-300 hover:bg-teal-600/10'
              } transition-all duration-200 whitespace-nowrap`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

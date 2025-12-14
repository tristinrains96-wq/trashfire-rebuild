'use client'

import { useScriptLabStore } from '@/store/scriptLab'
import OutlineTree from './OutlineTree'
import BeatTimeline from './BeatTimeline'
import SceneCards from './SceneCards'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Copy } from 'lucide-react'

export default function CanvasBody() {
  const { activeView, chat, outline, beats, sceneCards, draft, nextActions, showAdvanced } = useScriptLabStore()

  const renderChat = () => {
    if (chat.length === 0) {
      const primaryAction = nextActions[0]
      return (
        <div className="flex items-center justify-center h-96 text-gray-400">
          <div className="text-center">
            <div className="mb-4">
              <Image
                src="/trashfire-logo.png"
                alt="TrashFire"
                width={160}
                height={48}
                className="h-16 w-auto mx-auto opacity-80"
              />
            </div>
            <p className="text-lg mb-2">Welcome to Script Lab</p>
            <p className="text-sm mb-4">Start a conversation to create your script</p>
            {primaryAction && (
              <Button
                onClick={() => {
                  // This would trigger the action via KeyboardTray
                  console.log('Action:', primaryAction.prompt)
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4 p-6">
        {chat.slice(-6).map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.ts).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderDraft = () => {
    if (!draft) {
      const primaryAction = nextActions.find(action => action.label.includes('Generate') || action.label.includes('draft'))
      return (
        <div className="flex items-center justify-center h-96 text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">No Draft Available</p>
            <p className="text-sm mb-4">Generate a draft from your outline and scenes</p>
            {primaryAction && (
              <Button
                onClick={() => {
                  console.log('Action:', primaryAction.prompt)
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Script Draft</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(draft)}
            className="border-teal-600/50 text-teal-300 hover:bg-teal-600/20"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {draft}
          </pre>
        </div>
      </div>
    )
  }

  const renderEmptyState = (title: string, description: string, actionLabel?: string) => {
    const primaryAction = nextActions[0]
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">{title}</p>
          <p className="text-sm mb-4">{description}</p>
          {primaryAction && (
            <Button
              onClick={() => {
                console.log('Action:', primaryAction.prompt)
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      {activeView === 'chat' && renderChat()}
      {showAdvanced && activeView === 'outline' && (
        outline ? <OutlineTree outline={outline} /> : renderEmptyState('No Outline Available', 'Ask me to create an outline to get started')
      )}
      {showAdvanced && activeView === 'beats' && (
        beats.length > 0 ? <BeatTimeline beats={beats} /> : renderEmptyState('No Beat Sheet Available', 'Ask me to create a beat sheet to get started')
      )}
      {showAdvanced && activeView === 'scenes' && (
        sceneCards.length > 0 ? <SceneCards cards={sceneCards} /> : renderEmptyState('No Scene Cards Available', 'Ask me to create scene cards to get started')
      )}
      {showAdvanced && activeView === 'draft' && renderDraft()}
    </div>
  )
}

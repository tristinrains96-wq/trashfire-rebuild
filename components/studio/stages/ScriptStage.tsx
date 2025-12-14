'use client'

import { StylePack } from '@/flows/StudioFlowController'
import { getStylePackLabel } from '@/styles/style-packs'
import { useStudioStore } from '@/store/useStudioStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, FileText, Users } from 'lucide-react'

interface ScriptStageProps {
  stylePack?: StylePack
}

export default function ScriptStage({ stylePack }: ScriptStageProps) {
  const messages = useStudioStore((state) => state.messages)
  const setActive = useStudioStore((state) => state.setActive)

  return (
    <div className="h-full flex flex-col">
      {/* Chat area - full height */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <MessageCircle className="h-16 w-16 text-teal-400/60 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-3">Start Your Story</h3>
            <p className="text-teal-300/70 mb-8 max-w-md">
              Tell me about your story idea, characters, or world. I&apos;ll help you build it into a complete episode.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-teal-500/20 text-white'
                      : 'bg-zinc-800/50 text-gray-300'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.options && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs hover:bg-teal-500/20"
                          onClick={() => {
                            if (option.action.startsWith('goto:')) {
                              const panel = option.action.split(':')[1] as any
                              setActive(panel)
                            }
                          }}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-sm text-teal-300/60 text-center mt-4">
        Type below to refine or say &apos;next&apos; to continue.
      </p>
    </div>
  )
}

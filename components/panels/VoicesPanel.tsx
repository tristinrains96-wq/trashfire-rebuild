'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, Volume2 } from 'lucide-react'

const voices = [
  { id: 1, name: 'Narrator', gender: 'Male', accent: 'American' },
  { id: 2, name: 'Character A', gender: 'Female', accent: 'British' },
  { id: 3, name: 'Character B', gender: 'Male', accent: 'Australian' },
  { id: 4, name: 'Character C', gender: 'Female', accent: 'Canadian' },
]

export default function VoicesPanel() {
  const [playingVoice, setPlayingVoice] = useState<number | null>(null)

  const togglePlay = (voiceId: number) => {
    setPlayingVoice(playingVoice === voiceId ? null : voiceId)
  }

  return (
    <div className="space-y-6 px-4">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {voices.map((voice) => (
            <Card key={voice.id} className="bg-surface">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{voice.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>{voice.gender}</span>
                  <span>•</span>
                  <span>{voice.accent}</span>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => togglePlay(voice.id)}
                  >
                    {playingVoice === voice.id ? (
                      <Pause className="h-4 w-4 mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Preview
                  </Button>
                  
                  {playingVoice === voice.id && (
                    <div className="flex items-center gap-1 h-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="wave-bar w-1 rounded-full"
                          style={{
                            animationDelay: `${i * 0.1}s`,
                            height: `${Math.random() * 12 + 4}px`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

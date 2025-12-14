'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Music, Volume2, Clock } from 'lucide-react'

const tracks = [
  { 
    id: 1, 
    name: 'Epic Adventure', 
    mood: 'Epic', 
    duration: '3:24',
    waveform: [20, 40, 15, 60, 30, 45, 25, 35, 50, 20, 30, 40]
  },
  { 
    id: 2, 
    name: 'Mysterious Forest', 
    mood: 'Mysterious', 
    duration: '2:45',
    waveform: [15, 25, 35, 20, 45, 30, 40, 25, 30, 35, 20, 25]
  },
  { 
    id: 3, 
    name: 'Battle Theme', 
    mood: 'Intense', 
    duration: '4:12',
    waveform: [50, 60, 45, 70, 55, 65, 50, 60, 45, 55, 50, 60]
  },
  { 
    id: 4, 
    name: 'Peaceful Village', 
    mood: 'Calm', 
    duration: '3:08',
    waveform: [15, 20, 10, 25, 15, 20, 12, 18, 22, 15, 20, 18]
  },
]

export default function MusicPanel() {
  return (
    <div className="space-y-6 px-4">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track) => (
            <Card key={track.id} className="bg-surface">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{track.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {track.mood}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Clock className="h-4 w-4" />
                  <span>{track.duration}</span>
                </div>
                
                {/* Waveform */}
                <div className="flex items-end gap-1 h-8">
                  {track.waveform.map((height, i) => (
                    <div
                      key={i}
                      className="bg-accent rounded-sm"
                      style={{ height: `${height}%`, width: '4px' }}
                    />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Set as Underscore
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full">
                  Cue for Scene
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

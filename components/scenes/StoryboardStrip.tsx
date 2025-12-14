'use client'

import { Scene } from '@/store/sceneStore'
import { Card, CardContent } from '@/components/ui/card'

interface StoryboardStripProps {
  scenes: Scene[]
  activeSceneId: string | null
  onSceneSelect: (sceneId: string) => void
}

export default function StoryboardStrip({ scenes, activeSceneId, onSceneSelect }: StoryboardStripProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
      {scenes.map((scene, index) => (
        <Card
          key={scene.id}
          className={`
            flex-shrink-0 w-48 cursor-pointer transition-all duration-200
            ${activeSceneId === scene.id 
              ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20' 
              : 'border-border hover:border-accent/50 hover:bg-accent/5'
            }
          `}
          onClick={() => onSceneSelect(scene.id)}
        >
          <CardContent className="p-4">
            {/* Scene Thumbnail Placeholder */}
            <div className="w-full h-24 bg-surface rounded-lg mb-3 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">S{index + 1}</span>
            </div>
            
            {/* Scene Info */}
            <div className="space-y-1">
              <h3 className="font-semibold text-text-primary text-sm">
                {scene.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {scene.location} • {scene.timeOfDay}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.floor(scene.estDurationSec / 60)}:{(scene.estDurationSec % 60).toString().padStart(2, '0')}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {scene.speakers.slice(0, 2).map((speaker) => (
                  <span 
                    key={speaker}
                    className="text-xs bg-accent/20 text-accent px-2 py-1 rounded"
                  >
                    {speaker}
                  </span>
                ))}
                {scene.speakers.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{scene.speakers.length - 2}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

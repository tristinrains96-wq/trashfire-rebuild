'use client'

import { StylePack } from '@/flows/StudioFlowController'
import { getStylePackLabel } from '@/styles/style-packs'
import { useStudioStore } from '@/store/useStudioStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Play, Users, Film } from 'lucide-react'

interface VoicesStageProps {
  stylePack?: StylePack
}

export default function VoicesStage({ stylePack }: VoicesStageProps) {
  const setActive = useStudioStore((state) => state.setActive)

  return (
    <div className="h-full flex flex-col">
      {/* Voice waveform area - full height */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-64 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg mx-auto mb-8 flex items-center justify-center">
          <div className="flex gap-1">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-1 bg-orange-400/60 rounded-full"
                style={{ height: `${Math.random() * 40 + 10}px` }}
              />
            ))}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">Voice Library</h3>
        <p className="text-teal-300/70 mb-8 max-w-md">
          Browse our voice collection and assign them to your characters. Each voice remembers its character.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            variant="default" 
            className="gap-2 bg-teal-500 hover:bg-teal-600"
            disabled
          >
            <Play className="h-4 w-4" />
            Browse Voice Library
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActive('characters')}
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
          >
            <Users className="h-4 w-4" />
            Assign to Characters
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActive('scenes')}
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
          >
            <Film className="h-4 w-4" />
            Create Scenes
          </Button>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-sm text-teal-300/60 text-center mt-4">
        Type below to refine or say &apos;next&apos; to continue.
      </p>
    </div>
  )
}

'use client'

import { StylePack } from '@/flows/StudioFlowController'
import { getStylePackLabel } from '@/styles/style-packs'
import { useStudioStore } from '@/store/useStudioStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Film, Play, Image as ImageIcon, Mic } from 'lucide-react'

interface ScenesStageProps {
  stylePack?: StylePack
}

export default function ScenesStage({ stylePack }: ScenesStageProps) {
  const setActive = useStudioStore((state) => state.setActive)

  return (
    <div className="h-full flex flex-col">
      {/* Storyboard strip area - full height */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="flex gap-4 justify-center mb-8 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-24 h-16 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Film className="h-8 w-8 text-rose-400/60" />
            </div>
          ))}
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">Storyboard Strip</h3>
        <p className="text-teal-300/70 mb-8 max-w-md">
          Your scenes will appear here as storyboard panels. Each scene combines characters, backgrounds, and voices.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            variant="default" 
            className="gap-2 bg-teal-500 hover:bg-teal-600"
            disabled
          >
            <Play className="h-4 w-4" />
            Create Storyboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActive('backgrounds')}
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
          >
            <ImageIcon className="h-4 w-4" />
            Add Backgrounds
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActive('voices')}
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
          >
            <Mic className="h-4 w-4" />
            Assign Voices
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

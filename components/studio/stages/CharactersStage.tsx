'use client'

import { StylePack } from '@/flows/StudioFlowController'
import { getStylePackLabel } from '@/styles/style-packs'
import { useStudioStore } from '@/store/useStudioStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Palette, Mic, Wand2 } from 'lucide-react'

interface CharactersStageProps {
  stylePack?: StylePack
}

export default function CharactersStage({ stylePack }: CharactersStageProps) {
  const setActive = useStudioStore((state) => state.setActive)

  return (
    <div className="h-full flex flex-col">
      {/* Character turntable area - full height */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mx-auto mb-8 flex items-center justify-center">
          <Users className="h-20 w-20 text-blue-400/60" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">Character Turntable</h3>
        <p className="text-teal-300/70 mb-8 max-w-md">
          Your characters will appear here as you create them. Upload references or describe them to get started.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            variant="default" 
            className="gap-2 bg-teal-500 hover:bg-teal-600"
            disabled
          >
            <Wand2 className="h-4 w-4" />
            Generate Master Sheet
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActive('voices')}
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
          >
            <Mic className="h-4 w-4" />
            Assign Voice
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActive('backgrounds')}
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
          >
            <Palette className="h-4 w-4" />
            Design Background
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

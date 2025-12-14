'use client'

import { StylePack } from '@/flows/StudioFlowController'
import { getStylePackLabel } from '@/styles/style-packs'
import { useStudioStore } from '@/store/useStudioStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Image as ImageIcon, Palette, Film, Wand2 } from 'lucide-react'

interface BackgroundsStageProps {
  stylePack?: StylePack
}

export default function BackgroundsStage({ stylePack }: BackgroundsStageProps) {
  const setActive = useStudioStore((state) => state.setActive)

  return (
    <div className="h-full flex flex-col">
      {/* Background grid area - full height */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-purple-400/60" />
            </div>
          ))}
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">Environment Gallery</h3>
        <p className="text-teal-300/70 mb-8 max-w-md">
          Your backgrounds will appear here. Describe locations, upload references, or let AI generate them.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            variant="default" 
            className="gap-2 bg-teal-500 hover:bg-teal-600"
            disabled
          >
            <Wand2 className="h-4 w-4" />
            Generate Backgrounds
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActive('scenes')}
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
          >
            <Film className="h-4 w-4" />
            Create Scenes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActive('characters')}
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
          >
            <Palette className="h-4 w-4" />
            Design Characters
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

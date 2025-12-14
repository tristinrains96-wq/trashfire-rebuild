'use client'

import { StylePack } from '@/flows/StudioFlowController'
import { getStylePackLabel } from '@/styles/style-packs'
import { useStudioStore } from '@/store/useStudioStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Download, Settings, Film } from 'lucide-react'

interface EpisodeStageProps {
  stylePack?: StylePack
}

export default function EpisodeStage({ stylePack }: EpisodeStageProps) {
  const setActive = useStudioStore((state) => state.setActive)

  return (
    <div className="h-full flex flex-col">
      {/* Preview/export area - full height */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-80 h-48 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg mx-auto mb-8 flex items-center justify-center">
          <div className="text-center">
            <Play className="h-16 w-16 text-teal-400/60 mx-auto mb-2" />
            <p className="text-teal-300/70">Episode Preview</p>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">Final Episode</h3>
        <p className="text-teal-300/70 mb-8 max-w-md">
          Your complete episode ready for preview and export. All scenes, characters, and voices combined.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            variant="default" 
            className="gap-2 bg-teal-500 hover:bg-teal-600"
            disabled
          >
            <Play className="h-4 w-4" />
            Preview Episode
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
            disabled
          >
            <Download className="h-4 w-4" />
            Export Video
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActive('scenes')}
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
          >
            <Film className="h-4 w-4" />
            Edit Scenes
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20"
            disabled
          >
            <Settings className="h-4 w-4" />
            Export Settings
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

'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStudioStore } from '@/store/useStudioStore'
import ScriptStage from './stages/ScriptStage'
import CharactersStage from './stages/CharactersStage'
import BackgroundsStage from './stages/BackgroundsStage'
import VoicesStage from './stages/VoicesStage'
import ScenesStage from './stages/ScenesStage'
import EpisodeStage from './stages/EpisodeStage'

export default function StudioCanvas() {
  const [isClient, setIsClient] = useState(false)
  const activePanel = useStudioStore((state) => state?.activePanel) || 'script'
  const stylePack = useStudioStore((state) => state?.stylePack)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const stageComponents = {
    script: ScriptStage,
    characters: CharactersStage,
    backgrounds: BackgroundsStage,
    voices: VoicesStage,
    scenes: ScenesStage,
    episode: EpisodeStage
  }

  const StageComponent = stageComponents[activePanel as keyof typeof stageComponents] || ScriptStage

  // Debug logging
  console.log('StudioCanvas - isClient:', isClient)
  console.log('StudioCanvas - activePanel:', activePanel)
  console.log('StudioCanvas - StageComponent:', StageComponent)
  console.log('StudioCanvas - stageComponents keys:', Object.keys(stageComponents))

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-2"></div>
          <p className="text-text-secondary">Loading Studio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <StageComponent stylePack={stylePack} />
    </div>
  )
}

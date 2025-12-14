'use client'

import { memo } from 'react'
import BackgroundsStage from '@/components/studio/stages/BackgroundsStage'

// Memoized wrapper to prevent unnecessary re-renders
const BackgroundsPane = memo(() => {
  return (
    <div className="h-full">
      <BackgroundsStage />
    </div>
  )
})

BackgroundsPane.displayName = 'BackgroundsPane'

export default BackgroundsPane

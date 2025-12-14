'use client'

import { memo } from 'react'
import ScenesStage from '@/components/studio/stages/ScenesStage'

// Memoized wrapper to prevent unnecessary re-renders
const ScenesPane = memo(() => {
  return (
    <div className="h-full">
      <ScenesStage />
    </div>
  )
})

ScenesPane.displayName = 'ScenesPane'

export default ScenesPane

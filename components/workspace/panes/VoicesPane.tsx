'use client'

import { memo } from 'react'
import VoicesStage from '@/components/studio/stages/VoicesStage'

// Memoized wrapper to prevent unnecessary re-renders
const VoicesPane = memo(() => {
  return (
    <div className="h-full">
      <VoicesStage />
    </div>
  )
})

VoicesPane.displayName = 'VoicesPane'

export default VoicesPane

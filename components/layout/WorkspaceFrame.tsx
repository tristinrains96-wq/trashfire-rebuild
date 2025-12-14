'use client'

import TopBar from '@/components/TopBar'
import GenBox from '@/components/stage/GenBox'
import ChatStream from '@/components/stage/ChatStream'
import BottomStack from '@/components/layout/BottomStack'
import FloatingActionBar from '@/components/stage/FloatingActionBar'
import { useGenBox } from '@/hooks/useGenBox'

interface WorkspaceFrameProps {
  activeSection: string
  onSectionChange: (key: string) => void
  children: React.ReactNode
  previewState?: 'idle' | 'ready' | 'rendering'
  onPose?: () => void
  onLipSync?: () => void
  onOpenDNA?: () => void
  hidePreview?: boolean
  previewOverride?: React.ReactNode
}


export default function WorkspaceFrame({
  activeSection,
  onSectionChange,
  children,
  previewState = 'idle',
  onPose,
  onLipSync,
  onOpenDNA,
  hidePreview = false,
  previewOverride,
}: WorkspaceFrameProps) {
  const { handleAction } = useGenBox()

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed TopBar */}
      <TopBar />
      
      {/* Main content container */}
      <main className="flex-1" id="contentZone">
        {/* GenBox - main chat canvas */}
        {!hidePreview && !previewOverride && (
          <GenBox 
            status={previewState}
          >
            <ChatStream />
          </GenBox>
        )}
        {previewOverride}
      </main>

      {/* Floating Action Bar */}
      <FloatingActionBar 
        context={activeSection}
      />

      {/* Bottom Stack - Dock and Keyboard */}
      <BottomStack />
    </div>
  )
}

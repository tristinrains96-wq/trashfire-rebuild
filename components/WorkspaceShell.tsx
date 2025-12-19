'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import TopBar from './TopBar'
import GenBox from './stage/GenBox'
import BottomStack from './layout/BottomStack'
import FloatingActionBar from './stage/FloatingActionBar'
import { isDemoMode, showDemoModeMessage } from '@/lib/demoMode'

interface AssistAction {
  type: 'assist'
  action: 'refine_style' | 'add_outfit' | 'emotion_range' | 'match_voice' | 'keep_consistent'
}

export default function WorkspaceShell() {
  const [generating, setGenerating] = useState(false)
  const pathname = usePathname()
  
  // Get current section from pathname
  const currentSection = pathname.split('/').pop() || 'script'

  const handleAssist = async (action: AssistAction) => {
    console.log('Workspace assist action:', action)
    
    // Demo mode check
    if (isDemoMode()) {
      showDemoModeMessage('Character assist')
      return
    }
    
    try {
      const response = await fetch('/api/brain/character-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action.action,
        }),
      })
      const result = await response.json()
      console.log('Assist result:', result)
    } catch (error) {
      console.error('Assist error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <main className="flex-1">
        <GenBox 
          context={currentSection}
          status={generating ? 'rendering' : 'ready'}
        />
      </main>
      
      <FloatingActionBar context={currentSection} />
      <BottomStack />
    </div>
  )
}

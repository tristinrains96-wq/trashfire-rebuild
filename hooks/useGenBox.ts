'use client'

import { useCallback } from 'react'
import { useStudioStore } from '@/store/useStudioStore'
import { useRouter } from 'next/navigation'

export function useGenBox() {
  const setActive = useStudioStore((state) => state.setActive)
  const router = useRouter()

  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'generate-characters':
        setActive('characters')
        break
      case 'generate-backgrounds':
        setActive('backgrounds')
        break
      case 'assign-voices':
        setActive('voices')
        break
      case 'create-scenes':
        setActive('scenes')
        break
      case 'preview-episode':
        setActive('episode')
        break
      case 'generate':
        // Trigger AI generation based on current context
        console.log('Triggering AI generation')
        break
      case 'play':
        // Play current preview
        console.log('Playing preview')
        break
      case 'settings':
        // Open settings
        console.log('Opening settings')
        break
      case 'download':
        // Export/download
        console.log('Exporting content')
        break
      case 'share':
        // Share content
        console.log('Sharing content')
        break
      default:
        console.log('Unknown action:', action)
    }
  }, [setActive])

  return {
    handleAction
  }
}

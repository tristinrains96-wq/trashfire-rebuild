'use client'

import { useScriptLabStore } from '@/store/scriptLab'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface AdaptiveButtonProps {
  className?: string
}

export default function AdaptiveButton({ className = '' }: AdaptiveButtonProps) {
  const { planStatus, generatePlanFromDraft, approvePlan, markScenesBuilt } = useScriptLabStore()
  const router = useRouter()
  const [isBuilding, setIsBuilding] = useState(false)

  const getButtonConfig = () => {
    switch (planStatus) {
      case 'idle':
        return {
          label: 'Analyze script',
          onClick: () => generatePlanFromDraft(),
          variant: 'default' as const,
          disabled: false
        }
      case 'draft-plan':
        return {
          label: 'Approve plan',
          onClick: () => approvePlan(),
          variant: 'default' as const,
          disabled: false
        }
      case 'assets-needed':
        return {
          label: 'Create assets',
          onClick: () => {
            // Navigate to characters page with toast
            router.push('/workspace?section=characters')
            // In a real implementation, show toast here
          },
          variant: 'default' as const,
          disabled: false
        }
      case 'assets-ready':
        return {
          label: 'Build scenes',
          onClick: async () => {
            setIsBuilding(true)
            // Simulate building scenes
            setTimeout(() => {
              markScenesBuilt()
              setIsBuilding(false)
            }, 2000)
          },
          variant: 'default' as const,
          disabled: isBuilding
        }
      case 'scenes-ready':
        return {
          label: 'Preview episode',
          onClick: () => router.push('/workspace/episode'),
          variant: 'default' as const,
          disabled: false
        }
      default:
        return {
          label: 'Continue',
          onClick: () => {},
          variant: 'outline' as const,
          disabled: true
        }
    }
  }

  const config = getButtonConfig()

  return (
    <Button
      onClick={config.onClick}
      variant={config.variant}
      disabled={config.disabled}
      className={`w-full md:w-auto md:ml-auto bg-teal-600 hover:bg-teal-700 text-white ${className}`}
    >
      {isBuilding ? 'Building scenes...' : config.label}
    </Button>
  )
}

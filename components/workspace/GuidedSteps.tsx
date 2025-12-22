'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileText, Layout, Sparkles, Play } from 'lucide-react'
import { ProjectLabState } from '@/lib/demo/projectLabTypes'
import { generateMockScenePlan, generateMockPrompts } from '@/lib/demo/projectLabSeed'
import { toast } from '@/lib/toast'

interface GuidedStepsProps {
  projectLabState: ProjectLabState
  onUpdateState: (updates: Partial<ProjectLabState>) => void
}

export default function GuidedSteps({ projectLabState, onUpdateState }: GuidedStepsProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateScenePlan = () => {
    if (projectLabState.scriptText.length < 30) {
      toast.error('Script must be at least 30 characters long')
      return
    }

    setIsGenerating(true)
    setTimeout(() => {
      const scenePlan = generateMockScenePlan()
      const updatedScenes = projectLabState.categories.scenes.map((scene, idx) => ({
        ...scene,
        status: 'draft' as const,
        prompt: `Scene ${idx + 1} description`,
      }))

      onUpdateState({
        scenePlanText: scenePlan,
        categories: {
          ...projectLabState.categories,
          scenes: updatedScenes,
        },
      })
      toast.success('Scene plan generated!')
      setIsGenerating(false)
    }, 800)
  }

  const handleAutoFillAssets = () => {
    if (!projectLabState.scenePlanText) {
      toast.error('Generate scene plan first')
      return
    }

    setIsGenerating(true)
    setTimeout(() => {
      const updatedCharacters = projectLabState.categories.characters.map((char) => ({
        ...char,
        status: 'draft' as const,
        prompt: generateMockPrompts('characters', char.title),
      }))

      const updatedLocations = projectLabState.categories.locations.map((loc) => ({
        ...loc,
        status: 'draft' as const,
        prompt: generateMockPrompts('locations', loc.title),
      }))

      const updatedProps = projectLabState.categories.props.map((prop) => ({
        ...prop,
        status: 'draft' as const,
        prompt: generateMockPrompts('props', prop.title),
      }))

      onUpdateState({
        categories: {
          ...projectLabState.categories,
          characters: updatedCharacters,
          locations: updatedLocations,
          props: updatedProps,
        },
      })
      toast.success('Assets auto-filled!')
      setIsGenerating(false)
    }, 800)
  }

  const handlePreviewAnimatic = () => {
    const hasDraftScenes = projectLabState.categories.scenes.some(
      (scene) => scene.status === 'draft' || scene.status === 'locked'
    )

    if (!hasDraftScenes) {
      toast.error('Generate scene plan first')
      return
    }

    setIsGenerating(true)
    setTimeout(() => {
      onUpdateState({ previewReady: true })
      toast.success('Animatic preview ready!')
      setIsGenerating(false)
    }, 600)
  }

  const canGenerateScenePlan = projectLabState.scriptText.length >= 30
  const canAutoFill = !!projectLabState.scenePlanText
  const canPreview = projectLabState.categories.scenes.some(
    (scene) => scene.status === 'draft' || scene.status === 'locked'
  )

  const steps = [
    {
      id: 1,
      label: 'Write Script',
      icon: FileText,
      enabled: true,
      completed: canGenerateScenePlan,
    },
    {
      id: 2,
      label: 'Generate Scene Plan',
      icon: Layout,
      enabled: canGenerateScenePlan,
      completed: canAutoFill,
      onClick: handleGenerateScenePlan,
      loading: isGenerating,
    },
    {
      id: 3,
      label: 'Auto-Fill Assets',
      icon: Sparkles,
      enabled: canAutoFill,
      completed: projectLabState.categories.characters.some((c) => c.status === 'draft'),
      onClick: handleAutoFillAssets,
      loading: isGenerating,
    },
    {
      id: 4,
      label: 'Preview Animatic',
      icon: Play,
      enabled: canPreview,
      completed: projectLabState.previewReady,
      onClick: handlePreviewAnimatic,
      loading: isGenerating,
    },
  ]

  return (
    <div className="mb-6 p-4 rounded-lg bg-[#0a0f15]/80 backdrop-blur-sm border border-white/10">
      <div className="flex items-center gap-4 flex-wrap">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = step.enabled && !step.completed
          const isCompleted = step.completed

          return (
            <div key={step.id} className="flex items-center gap-2">
              <Button
                onClick={step.onClick}
                disabled={!step.enabled || step.loading}
                className={cn(
                  'relative flex items-center gap-2 transition-all',
                  isCompleted
                    ? 'bg-[#00ffea]/20 text-[#00ffea] border border-[#00ffea]/30'
                    : isActive
                    ? 'bg-[#00ffea] hover:bg-[#00e6d1] text-black font-semibold shadow-[0_0_20px_rgba(0,255,234,0.3)]'
                    : 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed',
                  step.loading && 'opacity-50'
                )}
                size="sm"
              >
                <Icon className="h-4 w-4" />
                <span>{step.label}</span>
                {isCompleted && (
                  <span className="ml-1 text-xs">✓</span>
                )}
              </Button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-8 transition-colors',
                    isCompleted ? 'bg-[#00ffea]/30' : 'bg-white/10'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


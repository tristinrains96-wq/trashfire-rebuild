'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useScriptLabStore } from '@/store/scriptLab'
import { mockLLM } from '@/lib/mockScriptLLM'
import EntityMappingModal from '@/components/script/EntityMappingModal'
import { userCharacters, userBackgrounds } from '@/lib/mockAssets'

const VIEW_TABS = [
  { key: 'chat', label: 'Chat' },
  { key: 'outline', label: 'Outline' },
  { key: 'beats', label: 'Beat Sheet' },
  { key: 'scenes', label: 'Scene Cards' }
] as const

const COMMAND_CHIPS = [
  { label: 'Refine outline', prompt: 'Refine outline: increase stakes in Act 2' },
  { label: 'Expand scene', prompt: 'Expand scene: detail S3 with conflict and reveal' },
  { label: 'Shorten episode', prompt: 'Shorten episode: target 8 minutes total' },
  { label: 'Detect entities', prompt: 'Detect entities' },
  { label: 'Make scene list', prompt: 'Make scene list' }
]

export default function CanvasTopBar() {
  const { activeView, setActiveView, pushUser, pushAssistant, setFromMockResult, canonicalScript } = useScriptLabStore()
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [detectedEntities, setDetectedEntities] = useState<{
    characters: string[]
    locations: string[]
  }>({ characters: [], locations: [] })
  
  const router = useRouter()

  const handleViewChange = (view: typeof VIEW_TABS[number]['key']) => {
    setActiveView(view)
  }

  const handleCommandChip = async (prompt: string) => {
    pushUser(prompt)
    
    try {
      const result = await mockLLM(prompt, useScriptLabStore.getState())
      pushAssistant(result.explainer)
      setFromMockResult(result)
    } catch (error) {
      console.error('Command error:', error)
      pushAssistant('Sorry, I encountered an error. Please try again.')
    }
  }

  const handlePromoteToScript = () => {
    if (canonicalScript) {
      // Already promoted
      return
    }
    
    // Generate canonical text from current data
    const { outline, sceneCards } = useScriptLabStore.getState()
    let script = ''
    
    if (outline) {
      script = generateCanonicalText(outline)
    } else if (sceneCards.length > 0) {
      script = generateCanonicalTextFromCards(sceneCards)
    } else {
      script = 'No script content available to promote.'
    }
    
    useScriptLabStore.getState().promoteToScript(script)
  }

  const handleAnalyzeAndMap = async () => {
    const script = canonicalScript || generateCanonicalText(useScriptLabStore.getState().outline)
    
    if (!script) {
      pushAssistant('No script content available to analyze. Please create an outline or scene cards first.')
      return
    }

    try {
      const response = await fetch('/api/script/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: script }),
      })
      
      const data = await response.json()
      
      setDetectedEntities({
        characters: data.detectedCharacters,
        locations: data.detectedLocations
      })
      
      setShowMappingModal(true)
    } catch (error) {
      console.error('Analysis failed:', error)
      pushAssistant('Analysis failed. Please try again.')
    }
  }

  const handleSaveMapping = (mapping: { characters: Record<string, string>, locations: Record<string, string> }) => {
    setShowMappingModal(false)
    pushAssistant('Entity mapping saved! Redirecting to scenes...')
    
    // Navigate to scenes page
    setTimeout(() => {
      router.push('/workspace/scenes')
    }, 1000)
  }

  return (
    <>
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="p-4">
          {/* View Tabs */}
          <div className="flex items-center gap-2 mb-4">
            {VIEW_TABS.map((tab) => (
              <Button
                key={tab.key}
                variant={activeView === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange(tab.key)}
                className={`${
                  activeView === tab.key
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Command Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {COMMAND_CHIPS.map((chip) => (
              <Button
                key={chip.label}
                variant="outline"
                size="sm"
                onClick={() => handleCommandChip(chip.prompt)}
                className="text-xs border-teal-600/30 text-teal-300 hover:bg-teal-600/20"
              >
                {chip.label}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handlePromoteToScript}
              disabled={!!canonicalScript}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {canonicalScript ? 'Promoted to Script' : 'Promote to Script'}
            </Button>
            
            <Button
              onClick={handleAnalyzeAndMap}
              variant="outline"
              className="border-teal-600/50 text-teal-300 hover:bg-teal-600/20"
            >
              Analyze & Map
            </Button>
          </div>
        </div>
      </div>

      {/* Entity Mapping Modal */}
      <EntityMappingModal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        detectedCharacters={detectedEntities.characters}
        detectedLocations={detectedEntities.locations}
        userCharacters={userCharacters}
        userBackgrounds={userBackgrounds}
        onSave={handleSaveMapping}
      />
    </>
  )
}

// Helper functions
function generateCanonicalText(outline: any): string {
  if (!outline) return ''
  
  let script = ''
  outline.acts.forEach((act: any) => {
    script += `\n=== ${act.title} ===\n\n`
    act.sequences.forEach((sequence: any) => {
      script += `${sequence.title}:\n`
      sequence.scenes.forEach((scene: any) => {
        script += `\n${scene.title} (${scene.estSec}s)\n`
        script += `[Scene description and dialogue would go here]\n`
      })
    })
  })
  
  return script.trim()
}

function generateCanonicalTextFromCards(cards: any[]): string {
  if (!cards.length) return ''
  
  let script = ''
  cards.forEach((card, index) => {
    script += `\nScene ${index + 1}: ${card.title}\n`
    script += `Location: ${card.location}\n`
    script += `Time: ${card.timeOfDay}\n`
    script += `Speakers: ${card.speakers.join(', ')}\n`
    script += `Duration: ${card.estSec}s\n`
    script += `[Scene content would go here]\n`
  })
  
  return script.trim()
}

'use client'

import { useScriptLabStore } from '@/store/scriptLab'
import { Button } from '@/components/ui/button'
import { mockLLM } from '@/lib/mockScriptLLM'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CanvasFooter() {
  const { nextActions, pushUser, pushAssistant, setFromMockResult, draft, outline } = useScriptLabStore()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = async (prompt: string) => {
    if (isProcessing) return
    
    setIsProcessing(true)
    pushUser(prompt)
    
    try {
      const result = await mockLLM(prompt, useScriptLabStore.getState())
      pushAssistant(result.explainer)
      setFromMockResult(result)
    } catch (error) {
      console.error('Action error:', error)
      pushAssistant('Sorry, I encountered an error. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAnalyzeAndMap = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    
    try {
      // Use draft if available, otherwise generate from outline
      const script = draft || (outline ? generateCanonicalText(outline) : '')
      
      if (!script) {
        pushAssistant('No script content available to analyze. Please create an outline or draft first.')
        return
      }

      const response = await fetch('/api/script/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: script }),
      })
      
      const data = await response.json()
      
      // For now, just navigate to scenes page
      // In a real implementation, you'd open the mapping modal first
      router.push('/workspace/scenes')
    } catch (error) {
      console.error('Analysis failed:', error)
      pushAssistant('Analysis failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (nextActions.length === 0) {
    return null
  }

  return (
    <div className="border-t border-teal-500/20 bg-background/95 backdrop-blur">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Next Actions</h3>
        <div className="flex flex-wrap gap-2">
          {nextActions.slice(0, 5).map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                if (action.label === 'Analyze & Map') {
                  handleAnalyzeAndMap()
                } else {
                  handleAction(action.prompt)
                }
              }}
              disabled={isProcessing}
              className="text-xs border-teal-600/30 text-teal-300 hover:bg-teal-600/20 hover:border-teal-400/50 transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/10"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper function to generate canonical text from outline
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

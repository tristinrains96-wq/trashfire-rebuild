'use client'

import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Sparkles, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/lib/toast'
import { useWorkspace } from '@/store/workspace'
import { SceneBlock as SceneBlockType, ScriptLine, EpisodeScaffold } from '@/types'
import SceneBlock from '@/components/script/SceneBlock'

// Memoized wrapper to prevent unnecessary re-renders
const ScriptPane = memo(() => {
  const { 
    currentScript, 
    setCurrentScript, 
    updateSceneBlock, 
    setEpisodeScaffold,
    setStatus,
    project 
  } = useWorkspace()
  
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAddScene = useCallback(() => {
    const newScene: SceneBlockType = {
      id: `scene_${Date.now()}`,
      title: `Scene ${currentScript.length + 1}`,
      lines: [
        { text: 'Enter your scene description or dialogue here...', character: 'NARRATOR' }
      ],
      assignedCharacters: [],
      assignedBackground: undefined,
      musicCue: undefined
    }
    setCurrentScript([...currentScript, newScene])
  }, [currentScript, setCurrentScript])

  const handleUpdateScene = useCallback((sceneId: string, updates: Partial<SceneBlockType>) => {
    updateSceneBlock(sceneId, updates)
  }, [updateSceneBlock])

  const handleDeleteScene = useCallback((sceneId: string) => {
    setCurrentScript(currentScript.filter(scene => scene.id !== sceneId))
  }, [currentScript, setCurrentScript])

  const handleAddBeat = useCallback((sceneId: string) => {
    const scene = currentScript.find(s => s.id === sceneId)
    if (scene) {
      const newLine: ScriptLine = {
        text: 'New beat...',
        character: 'NARRATOR'
      }
      updateSceneBlock(sceneId, { lines: [...scene.lines, newLine] })
    }
  }, [currentScript, updateSceneBlock])

  const handleKeepStory = useCallback(async () => {
    if (currentScript.length === 0) {
      toast.error('No scenes to process')
      return
    }

    setIsGenerating(true)
    setStatus('busy')

    try {
      // Simulate auto-mapping process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Extract characters and backgrounds from script
      const characters = new Set<string>()
      const backgrounds = new Set<string>()
      
      currentScript.forEach(scene => {
        scene.lines.forEach(line => {
          if (line.character && line.character !== 'NARRATOR') {
            characters.add(line.character)
          }
          // Simple location extraction from scene title
          if (scene.location) {
            backgrounds.add(scene.location)
          }
        })
      })

      const episodeScaffold: EpisodeScaffold = {
        episodeId: project.episodeId,
        title: project.title,
        scenes: currentScript,
        characters: Array.from(characters),
        backgrounds: Array.from(backgrounds),
        props: []
      }

      setEpisodeScaffold(episodeScaffold)
      setStatus('ready')
      
      toast.success(
        `Scaffold created: ${characters.size} characters, ${backgrounds.size} backgrounds, ${currentScript.length} scenes`
      )
    } catch (error) {
      console.error('Error creating scaffold:', error)
      toast.error('Failed to create scaffold')
      setStatus('error')
    } finally {
      setIsGenerating(false)
    }
  }, [currentScript, project, setEpisodeScaffold, setStatus])

  return (
    <div className="h-full flex flex-col">
      {/* Header with Keep Story button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Episode Script</h2>
          <Badge variant="secondary" className="bg-teal-500/20 text-teal-300 border-teal-500/30">
            {currentScript.length} scenes
          </Badge>
        </div>
        
        <Button
          onClick={handleKeepStory}
          disabled={isGenerating || currentScript.length === 0}
          className="gap-2 bg-teal-500 hover:bg-teal-600 text-white"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Keep Story
            </>
          )}
        </Button>
      </div>

      {/* Script Content */}
      <div className="flex-1 overflow-y-auto">
        {currentScript.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Plus className="h-8 w-8 text-teal-400/60" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">Start Writing Your Episode</h3>
            <p className="text-teal-300/70 mb-6 max-w-md">
              Create scenes with dialogue and descriptions. Click &quot;Keep Story&quot; when ready to auto-map characters and backgrounds.
            </p>
            <Button
              onClick={handleAddScene}
              className="gap-2 bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Plus className="h-4 w-4" />
              Add First Scene
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {currentScript.map((scene, index) => (
                <SceneBlock
                  key={scene.id}
                  scene={scene}
                  onUpdate={handleUpdateScene}
                  onDelete={handleDeleteScene}
                  onAddBeat={handleAddBeat}
                />
              ))}
            </AnimatePresence>
            
            {/* Add Scene Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-4"
            >
              <Button
                onClick={handleAddScene}
                variant="outline"
                className="gap-2 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              >
                <Plus className="h-4 w-4" />
                Add Scene
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-sm text-teal-300/60 text-center mt-4">
        Click on any text to edit inline. Use &quot;Keep Story&quot; to auto-map characters and backgrounds.
      </p>
    </div>
  )
})

ScriptPane.displayName = 'ScriptPane'

export default ScriptPane

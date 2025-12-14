'use client'

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Play, Eye, Download, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWorkspace } from '@/store/workspace'
import { SceneBlock } from '@/types'
import SceneCard from '@/components/episode/SceneCard'

// Memoized wrapper to prevent unnecessary re-renders
const EpisodePane = memo(() => {
  const { 
    currentScript, 
    updateSceneBlock, 
    episodeScaffold,
    project 
  } = useWorkspace()
  
  const [selectedScene, setSelectedScene] = useState<SceneBlock | null>(
    currentScript.length > 0 ? currentScript[0] : null
  )

  const handleSceneSelect = (scene: SceneBlock) => {
    setSelectedScene(scene)
  }

  const handleSceneUpdate = (sceneId: string, updates: Partial<SceneBlock>) => {
    updateSceneBlock(sceneId, updates)
    if (selectedScene?.id === sceneId) {
      setSelectedScene({ ...selectedScene, ...updates })
    }
  }

  const handleSceneGenerate = (sceneId: string) => {
    console.log('Generating scene:', sceneId)
    // TODO: Implement scene generation
  }

  const handlePreview = () => {
    console.log('Preview episode')
    // TODO: Implement episode preview
  }

  const handleExport = () => {
    console.log('Export episode')
    // TODO: Implement episode export
  }

  if (currentScript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Film className="h-8 w-8 text-purple-400/60" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-3">No Scenes Available</h3>
        <p className="text-teal-300/70 mb-6 max-w-md">
          Create scenes in the Script section first, then use &quot;Keep Story&quot; to generate the episode scaffold.
        </p>
        <Button
          onClick={() => {/* Navigate to script */}}
          className="gap-2 bg-teal-500 hover:bg-teal-600 text-white"
        >
          Go to Script
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Left Panel - Scene List */}
      <div className="w-1/3 border-r border-white/10 pr-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Scenes</h2>
          <Badge variant="secondary" className="bg-teal-500/20 text-teal-300 border-teal-500/30">
            {currentScript.length} scenes
          </Badge>
        </div>

        <div className="space-y-3">
          {currentScript.map((scene, index) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border cursor-pointer transition-all group ${
                selectedScene?.id === scene.id
                  ? 'border-teal-500/50 bg-teal-500/10'
                  : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-700/50'
              }`}
              onClick={() => handleSceneSelect(scene)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm font-medium">Scene {index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white truncate">{scene.title}</h3>
                  <p className="text-sm text-white/60 truncate">
                    {scene.lines.length} lines • {scene.assignedCharacters?.length || 0} characters
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {scene.assignedBackground && (
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  )}
                  {scene.musicCue && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Center Panel - Scene Workspace */}
      <div className="flex-1 px-6">
        {selectedScene ? (
          <div className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Scene Workspace</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>

            <div className="h-full overflow-y-auto">
              <SceneCard
                scene={selectedScene}
                onUpdate={handleSceneUpdate}
                onGenerate={handleSceneGenerate}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Film className="h-8 w-8 text-purple-400/60" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">Select a Scene</h3>
            <p className="text-teal-300/70 mb-6 max-w-md">
              Choose a scene from the list to assign characters, backgrounds, and generate content.
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

EpisodePane.displayName = 'EpisodePane'

export default EpisodePane

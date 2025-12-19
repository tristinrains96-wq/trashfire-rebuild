'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Image, Music, Play, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SceneBlock, Character, BackgroundId } from '@/types'
import { useWorkspace } from '@/store/workspace'
import { isDemoMode, showDemoModeMessage } from '@/lib/demoMode'

interface SceneCardProps {
  scene: SceneBlock
  onUpdate: (sceneId: string, updates: Partial<SceneBlock>) => void
  onGenerate: (sceneId: string) => void
}

export default function SceneCard({ scene, onUpdate, onGenerate }: SceneCardProps) {
  const { characters } = useWorkspace()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    // Demo mode: show message and return
    if (isDemoMode()) {
      showDemoModeMessage('Scene generation')
      return
    }
    
    setIsGenerating(true)
    // Simulate generation process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsGenerating(false)
    onGenerate(scene.id)
  }

  const handleCharacterSelect = (characterId: string) => {
    const currentCharacters = scene.assignedCharacters || []
    if (currentCharacters.includes(characterId)) {
      onUpdate(scene.id, {
        assignedCharacters: currentCharacters.filter(id => id !== characterId)
      })
    } else {
      onUpdate(scene.id, {
        assignedCharacters: [...currentCharacters, characterId]
      })
    }
  }

  const handleBackgroundSelect = (backgroundId: BackgroundId) => {
    onUpdate(scene.id, { assignedBackground: backgroundId })
  }

  const handleMusicSelect = (musicCue: string) => {
    onUpdate(scene.id, { musicCue })
  }

  const handleNotesUpdate = (notes: string) => {
    onUpdate(scene.id, { notes })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-white/10 rounded-xl p-6"
    >
      {/* Scene Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">{scene.title}</h3>
          <div className="flex gap-2">
            {scene.location && (
              <Badge variant="secondary" className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                {scene.location}
              </Badge>
            )}
            {scene.timeOfDay && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {scene.timeOfDay}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Scene Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Assignments */}
        <div className="space-y-4">
          {/* Characters */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assigned Characters
            </label>
            <div className="space-y-2">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    scene.assignedCharacters?.includes(character.id)
                      ? 'border-teal-500/50 bg-teal-500/10'
                      : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-700/50'
                  }`}
                  onClick={() => handleCharacterSelect(character.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{character.name}</h4>
                      <p className="text-sm text-white/60">{character.description}</p>
                    </div>
                    {character.voice && (
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        Voice
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Image className="h-4 w-4" />
              Background
            </label>
            <Select
              value={scene.assignedBackground || ''}
              onValueChange={handleBackgroundSelect}
            >
              <SelectTrigger className="bg-zinc-700/50 border-white/20">
                <SelectValue placeholder="Select background..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bg_1">Hage Church Interior</SelectItem>
                <SelectItem value="bg_2">Magic Knight Academy</SelectItem>
                <SelectItem value="bg_3">Forest Path</SelectItem>
                <SelectItem value="bg_4">Royal Capital</SelectItem>
                <SelectItem value="bg_5">Dungeon Chamber</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Music */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Music className="h-4 w-4" />
              Music Cue
            </label>
            <Select
              value={scene.musicCue || ''}
              onValueChange={handleMusicSelect}
            >
              <SelectTrigger className="bg-zinc-700/50 border-white/20">
                <SelectValue placeholder="Select music..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="music_1">Epic Battle Theme</SelectItem>
                <SelectItem value="music_2">Mysterious Atmosphere</SelectItem>
                <SelectItem value="music_3">Emotional Moment</SelectItem>
                <SelectItem value="music_4">Action Sequence</SelectItem>
                <SelectItem value="music_5">Calm Dialogue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column - Notes and Generate */}
        <div className="space-y-4">
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              Notes to Generator
            </label>
            <Textarea
              value={scene.notes || ''}
              onChange={(e) => handleNotesUpdate(e.target.value)}
              placeholder="Add specific notes for scene generation..."
              rows={6}
              className="bg-zinc-700/50 border-white/20 text-white resize-none"
            />
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 bg-teal-500 hover:bg-teal-600 text-white h-12 text-lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Generating Scene...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Generate Scene
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}


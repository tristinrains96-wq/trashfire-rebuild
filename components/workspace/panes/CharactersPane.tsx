'use client'

import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Palette, Mic, Plus, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWorkspace } from '@/store/workspace'
import { Character, VoiceSettings } from '@/types'
import VoiceTab from '@/components/characters/VoiceTab'

// Memoized wrapper to prevent unnecessary re-renders
const CharactersPane = memo(() => {
  const { characters, setCharacters, assignVoiceToCharacter, project } = useWorkspace()
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [activeTab, setActiveTab] = useState('design')

  const handleAddCharacter = () => {
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: `Character ${characters.length + 1}`,
      description: 'Describe this character...'
    }
    setCharacters([...characters, newCharacter])
    setSelectedCharacter(newCharacter)
  }

  const handleVoiceAssign = (characterId: string, voice: VoiceSettings) => {
    assignVoiceToCharacter(characterId, voice)
    setSelectedCharacter(prev => prev ? { ...prev, voice, assignedToEpisode: project.episodeId } : null)
  }

  return (
    <div className="h-full flex">
      {/* Left Panel - Character List */}
      <div className="w-1/3 border-r border-white/10 pr-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Characters</h2>
          <Button
            onClick={handleAddCharacter}
            className="gap-2 bg-teal-500 hover:bg-teal-600 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Character
          </Button>
        </div>

        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-400/60" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">No Characters Yet</h3>
            <p className="text-teal-300/70 mb-6 max-w-md">
              Create your first character to get started with voice assignment and design.
            </p>
            <Button
              onClick={handleAddCharacter}
              className="gap-2 bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Plus className="h-4 w-4" />
              Add First Character
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map((character) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedCharacter?.id === character.id
                    ? 'border-teal-500/50 bg-teal-500/10'
                    : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-700/50'
                }`}
                onClick={() => setSelectedCharacter(character)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{character.name}</h3>
                    <p className="text-sm text-white/60 truncate">{character.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {character.voice && (
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        <Mic className="h-3 w-3 mr-1" />
                        Voice
                      </Badge>
                    )}
                    {character.assignedToEpisode && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Assigned
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - Character Details */}
      <div className="flex-1 pl-6">
        {selectedCharacter ? (
          <div className="h-full">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{selectedCharacter.name}</h3>
              <p className="text-white/60">{selectedCharacter.description}</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="design" className="gap-2">
                  <Users className="h-4 w-4" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="voices" className="gap-2">
                  <Mic className="h-4 w-4" />
                  Voices
                </TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="h-full">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
                    <input
                      type="text"
                      value={selectedCharacter.name}
                      className="w-full p-3 bg-zinc-700/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                    <textarea
                      value={selectedCharacter.description}
                      rows={4}
                      className="w-full p-3 bg-zinc-700/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-teal-500 resize-none"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center h-48 text-center rounded-xl border border-white/10 bg-zinc-800/40">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Palette className="h-6 w-6 text-purple-400/60" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">Outfit Design (coming soon)</h3>
                    <p className="text-teal-300/70 text-xs max-w-md">
                      Character outfit customization will be available here.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="voices" className="h-full">
                <VoiceTab
                  characterId={selectedCharacter.id}
                  characterName={selectedCharacter.name}
                  currentVoice={selectedCharacter.voice}
                  onAssignVoice={(voice) => handleVoiceAssign(selectedCharacter.id, voice)}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-400/60" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">Select a Character</h3>
            <p className="text-teal-300/70 mb-6 max-w-md">
              Choose a character from the list to view details, assign voice, and customize.
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

CharactersPane.displayName = 'CharactersPane'

export default CharactersPane

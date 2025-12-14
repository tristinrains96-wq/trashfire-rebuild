'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Mic, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { VoiceSettings } from '@/types'
import { useWorkspace } from '@/store/workspace'

interface VoiceTabProps {
  characterId: string
  characterName: string
  currentVoice?: VoiceSettings
  onAssignVoice: (voice: VoiceSettings) => void
}

const mockVoices: VoiceSettings[] = [
  {
    id: 'voice_1',
    name: 'Deep Male',
    pitch: 30,
    speed: 50,
    emotion: 'neutral',
    previewUrl: '/mock/voice1.mp3'
  },
  {
    id: 'voice_2', 
    name: 'Soft Female',
    pitch: 70,
    speed: 45,
    emotion: 'warm',
    previewUrl: '/mock/voice2.mp3'
  },
  {
    id: 'voice_3',
    name: 'Energetic Teen',
    pitch: 60,
    speed: 70,
    emotion: 'excited',
    previewUrl: '/mock/voice3.mp3'
  },
  {
    id: 'voice_4',
    name: 'Wise Elder',
    pitch: 25,
    speed: 35,
    emotion: 'calm',
    previewUrl: '/mock/voice4.mp3'
  }
]

const emotions = [
  'neutral', 'happy', 'sad', 'angry', 'excited', 'calm', 'warm', 'cold', 'mysterious'
]

export default function VoiceTab({ characterId, characterName, currentVoice, onAssignVoice }: VoiceTabProps) {
  const [selectedVoice, setSelectedVoice] = useState<VoiceSettings | null>(currentVoice || null)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [customSettings, setCustomSettings] = useState<Partial<VoiceSettings>>({
    pitch: selectedVoice?.pitch || 50,
    speed: selectedVoice?.speed || 50,
    emotion: selectedVoice?.emotion || 'neutral'
  })

  const handleVoiceSelect = (voiceId: string) => {
    const voice = mockVoices.find(v => v.id === voiceId)
    if (voice) {
      setSelectedVoice(voice)
      setCustomSettings({
        pitch: voice.pitch,
        speed: voice.speed,
        emotion: voice.emotion
      })
    }
  }

  const handlePlayPreview = (voiceId: string) => {
    setIsPlaying(isPlaying === voiceId ? null : voiceId)
    // Simulate audio playback
    setTimeout(() => setIsPlaying(null), 2000)
  }

  const handleAssignVoice = () => {
    if (selectedVoice) {
      const finalVoice: VoiceSettings = {
        ...selectedVoice,
        ...customSettings
      }
      onAssignVoice(finalVoice)
    }
  }

  const isAssigned = currentVoice && currentVoice.id === selectedVoice?.id

  return (
    <div className="space-y-6">
      {/* Voice Library */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Voice Library</h3>
        <div className="grid grid-cols-1 gap-3">
          {mockVoices.map((voice) => (
            <motion.div
              key={voice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedVoice?.id === voice.id
                  ? 'border-teal-500/50 bg-teal-500/10'
                  : 'border-white/10 bg-zinc-800/50 hover:bg-zinc-700/50'
              }`}
              onClick={() => handleVoiceSelect(voice.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
                    <Mic className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{voice.name}</h4>
                    <p className="text-sm text-white/60">
                      Pitch: {voice.pitch} • Speed: {voice.speed} • {voice.emotion}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayPreview(voice.id)
                    }}
                    className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
                  >
                    {isPlaying === voice.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  {selectedVoice?.id === voice.id && (
                    <div className="w-2 h-2 bg-teal-400 rounded-full" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Voice Customization */}
      {selectedVoice && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 p-4 bg-zinc-800/30 rounded-lg border border-white/10"
        >
          <h4 className="font-medium text-white">Customize Voice</h4>
          
          {/* Pitch Slider */}
          <div className="space-y-2">
            <label className="text-sm text-white/80">Pitch: {customSettings.pitch}</label>
            <Slider
              value={[customSettings.pitch || 50]}
              onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, pitch: value }))}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Speed Slider */}
          <div className="space-y-2">
            <label className="text-sm text-white/80">Speed: {customSettings.speed}</label>
            <Slider
              value={[customSettings.speed || 50]}
              onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, speed: value }))}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Emotion Select */}
          <div className="space-y-2">
            <label className="text-sm text-white/80">Emotion</label>
            <Select
              value={customSettings.emotion}
              onValueChange={(value) => setCustomSettings(prev => ({ ...prev, emotion: value }))}
            >
              <SelectTrigger className="bg-zinc-700/50 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {emotions.map((emotion) => (
                  <SelectItem key={emotion} value={emotion} className="capitalize">
                    {emotion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* Assign Voice Button */}
      {selectedVoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
              <Mic className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">{selectedVoice.name}</h4>
              <p className="text-sm text-white/60">
                Pitch: {customSettings.pitch} • Speed: {customSettings.speed} • {customSettings.emotion}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAssigned && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Saved to Episode 1
              </Badge>
            )}
            <Button
              onClick={handleAssignVoice}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Assign Voice
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}


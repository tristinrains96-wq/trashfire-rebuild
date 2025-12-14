'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X, Palette, Zap, Mic, Lock, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CharacterDNASidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CharacterDNASidebar({ isOpen, onClose }: CharacterDNASidebarProps) {
  const [emotionCurve, setEmotionCurve] = useState([0.2, 0.4, 0.6, 0.8])
  const [motionEnergy, setMotionEnergy] = useState([0.5])
  const [voiceProvider, setVoiceProvider] = useState<'local' | 'elevenlabs'>('local')
  const [identityLocked, setIdentityLocked] = useState(false)

  const paletteSwatches = [
    { name: 'Primary', color: '#00F5D4' },
    { name: 'Secondary', color: '#4BE5D2' },
    { name: 'Accent', color: '#6C8BFF' },
    { name: 'Neutral', color: '#A8B3B8' }
  ]

  const renderAppearanceSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5" />
          Appearance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Style */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Style</label>
          <div className="flex gap-2">
            <Badge variant="secondary">Realistic</Badge>
            <Badge variant="outline">Anime</Badge>
            <Badge variant="outline">Cartoon</Badge>
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Age</label>
          <Slider
            value={[25]}
            max={80}
            min={18}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-text-disabled mt-1">25 years old</div>
        </div>

        {/* Build */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Build</label>
          <div className="flex gap-2">
            <Badge variant="outline">Slim</Badge>
            <Badge variant="secondary">Average</Badge>
            <Badge variant="outline">Athletic</Badge>
          </div>
        </div>

        {/* Palette */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Color Palette</label>
          <div className="flex gap-2">
            {paletteSwatches.map((swatch) => (
              <div
                key={swatch.name}
                className="w-8 h-8 rounded-full border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: swatch.color }}
                title={swatch.name}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderBehaviorSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" />
          Behavior
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emotion Curve */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Emotion Curve</label>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-disabled">
              <span>Calm</span>
              <span>Excited</span>
            </div>
            <div className="relative h-16 bg-surface rounded border">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <path
                  d={`M 0,${60 - emotionCurve[0] * 60} Q 25,${60 - emotionCurve[1] * 60} 50,${60 - emotionCurve[2] * 60} T 100,${60 - emotionCurve[3] * 60}`}
                  stroke="#00F5D4"
                  strokeWidth="2"
                  fill="none"
                />
                {emotionCurve.map((point, index) => (
                  <circle
                    key={index}
                    cx={index * 33.33}
                    cy={60 - point * 60}
                    r="4"
                    fill="#00F5D4"
                    className="cursor-pointer hover:r-6 transition-all"
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Motion Energy */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Motion Energy</label>
          <Slider
            value={motionEnergy}
            onValueChange={setMotionEnergy}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
          <div className="text-xs text-text-disabled mt-1">
            {Math.round(motionEnergy[0] * 100)}% energy
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderVoiceSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mic className="h-5 w-5" />
          Voice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Provider */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Voice Provider</label>
          <div className="flex gap-2">
            <Button
              variant={voiceProvider === 'local' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVoiceProvider('local')}
            >
              Local (Piper)
            </Button>
            <Button
              variant={voiceProvider === 'elevenlabs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVoiceProvider('elevenlabs')}
              className="flex items-center gap-1"
            >
              <span>⭐ ElevenLabs</span>
            </Button>
          </div>
        </div>

        {/* Voice Card */}
        <div>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => console.log('Play voice card')}
          >
            <Play className="h-4 w-4" />
            Play Voice Card
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderIdentitySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5" />
          Identity Lock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seed */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">Seed</label>
          <div className="bg-surface rounded p-2 font-mono text-sm text-text-secondary">
            1234567890
          </div>
        </div>

        {/* LoRA/Adapter */}
        <div>
          <label className="text-sm font-medium text-text-primary mb-2 block">LoRA/Adapter</label>
          <div className="flex gap-2">
            <Badge variant="secondary">Character_LoRA_v2</Badge>
            <Badge variant="outline">Style_Adapter</Badge>
          </div>
        </div>

        {/* Identity Lock Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-text-primary">Lock identity for episode</div>
            <div className="text-xs text-text-disabled">Prevents character drift during generation</div>
          </div>
          <Switch
            checked={identityLocked}
            onCheckedChange={setIdentityLocked}
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">Character DNA</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Sections */}
              <div className="space-y-6">
                {renderAppearanceSection()}
                {renderBehaviorSection()}
                {renderVoiceSection()}
                {renderIdentitySection()}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

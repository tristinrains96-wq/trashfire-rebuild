'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useSceneStore } from '@/store/sceneStore'
import { userCharacters, userBackgrounds } from '@/lib/mockAssets'
import { toast } from '@/lib/toast'
import StoryboardStrip from './StoryboardStrip'

export default function ScenesPreviz() {
  const router = useRouter()
  const { sceneGraph, mapping, activeSceneId, setActiveScene } = useSceneStore()
  const [premiumMotion, setPremiumMotion] = useState(false)
  const [motionIntensity, setMotionIntensity] = useState([50])

  // If no scene graph, show empty state
  if (!sceneGraph) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md bg-background border-border">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No Analyzed Script
            </h3>
            <p className="text-muted-foreground mb-6">
              Go to Script to analyze your script and create scenes.
            </p>
            <Button onClick={() => router.push('/workspace?section=script')}>
              Go to Script
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeScene = sceneGraph.scenes.find(scene => scene.id === activeSceneId) || sceneGraph.scenes[0]
  
  // Get mapped assets
  const getMappedCharacter = (characterName: string) => {
    const assetId = mapping?.characters[characterName]
    if (!assetId || assetId === 'auto') return 'Generated Placeholder'
    
    const character = userCharacters.find(c => c.id === assetId)
    return character?.name || 'Generated Placeholder'
  }
  
  const getMappedBackground = (location: string) => {
    const assetId = mapping?.locations[location]
    if (!assetId || assetId === 'auto') return 'Generated Placeholder'
    
    const background = userBackgrounds.find(bg => bg.id === assetId)
    return background?.name || 'Generated Placeholder'
  }

  const handlePlayPreview = () => {
    toast.info('Preview stub - would play scene preview')
  }

  return (
    <div className="space-y-8">
      {/* Storyboard Strip */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Storyboard</h2>
        <StoryboardStrip
          scenes={sceneGraph.scenes}
          activeSceneId={activeSceneId}
          onSceneSelect={setActiveScene}
        />
      </div>

      {/* Previz Panel */}
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-text-primary">
            Scene {sceneGraph.scenes.findIndex(s => s.id === activeScene.id) + 1}: {activeScene.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scene Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Background:</h4>
              <p className="text-muted-foreground">
                {getMappedBackground(activeScene.location)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Characters in scene:</h4>
              <div className="flex flex-wrap gap-2">
                {activeScene.speakers.map((speaker) => (
                  <span 
                    key={speaker}
                    className="text-sm bg-accent/20 text-accent px-2 py-1 rounded"
                  >
                    {getMappedCharacter(speaker)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Scene Controls</h4>
              <div className="space-y-4">
                {/* DoF Control */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Depth of Field</span>
                  <div className="flex gap-2">
                    {['Low', 'Med', 'High'].map((level) => (
                      <Button
                        key={level}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Motion Intensity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-primary">Motion Intensity</span>
                    <span className="text-sm text-muted-foreground">{motionIntensity[0]}%</span>
                  </div>
                  <Slider
                    value={motionIntensity}
                    onValueChange={setMotionIntensity}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Premium Motion */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-text-primary">⭐ Premium Motion</span>
                    {premiumMotion && (
                      <p className="text-xs text-accent">Est. +40 Sparks</p>
                    )}
                  </div>
                  <Switch
                    checked={premiumMotion}
                    onCheckedChange={setPremiumMotion}
                  />
                </div>
              </div>
            </div>

            {/* Play Button */}
            <Button 
              onClick={handlePlayPreview}
              className="w-full"
              size="lg"
            >
              ▶ Play Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

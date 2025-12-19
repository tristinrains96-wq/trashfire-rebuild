'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Play, Clock } from 'lucide-react'
import ProgressLoader from '@/components/workspace/ProgressLoader'

const storyboardCards = [
  { id: 1, title: 'Opening Scene', status: 'Ready', thumbnail: 'Scene 1' },
  { id: 2, title: 'Character Intro', status: 'Processing', thumbnail: 'Scene 2' },
  { id: 3, title: 'Action Sequence', status: 'Ready', thumbnail: 'Scene 3' },
  { id: 4, title: 'Closing Scene', status: 'Draft', thumbnail: 'Scene 4' },
]

export default function ScenesPanel() {
  const [motionIntensity, setMotionIntensity] = useState([50])
  const [premium, setPremium] = useState(false)
  const [duration, setDuration] = useState('30')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  return (
    <div className="space-y-6 px-4">
      {/* Progress indicator when generating */}
      {isGenerating && (
        <div className="flex items-center justify-center py-8">
          <ProgressLoader 
            progress={generationProgress} 
            label="Generating Scenes..."
            size="lg"
          />
        </div>
      )}
      
      <div>
        {/* Storyboard Strip */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-3">Storyboard</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {storyboardCards.map((scene) => (
              <Card key={scene.id} className="bg-surface min-w-[200px]">
                <CardHeader className="pb-2">
                  <div className="aspect-video bg-border rounded mb-2 flex items-center justify-center">
                    <span className="text-sm text-text-secondary">{scene.thumbnail}</span>
                  </div>
                  <CardTitle className="text-sm">{scene.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge 
                    variant={scene.status === 'Ready' ? 'default' : scene.status === 'Processing' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {scene.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Camera Motion
            </label>
            <Select defaultValue="static">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="pan">Pan</SelectItem>
                <SelectItem value="dolly">Dolly</SelectItem>
                <SelectItem value="orbit">Orbit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Motion Intensity: {motionIntensity[0]}%
            </label>
            <Slider
              value={motionIntensity}
              onValueChange={setMotionIntensity}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="premium"
                checked={premium}
                onCheckedChange={setPremium}
              />
              <label htmlFor="premium" className="text-sm font-medium text-text-primary">
                Premium ⭐
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Duration (seconds)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="flex-1"
                placeholder="30"
              />
              <span className="text-sm text-text-secondary">seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

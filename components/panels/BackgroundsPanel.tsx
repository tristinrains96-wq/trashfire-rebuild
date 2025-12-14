'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Maximize, Settings, RotateCcw } from 'lucide-react'

export default function BackgroundsPanel() {
  const [lighting, setLighting] = useState([50])
  const [weather, setWeather] = useState([30])
  const [depthOfField, setDepthOfField] = useState([70])

  return (
    <div className="space-y-6 px-4">
      <div>
        {/* Environment Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-surface">
              <CardContent className="p-3">
                <div className="aspect-video bg-border rounded mb-2 flex items-center justify-center">
                  <span className="text-sm text-text-secondary">Env {i + 1}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Maximize className="h-3 w-3 mr-1" />
                    Full
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="h-3 w-3 mr-1" />
                    Set
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Replace in Scene
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Lighting: {lighting[0]}%
              </label>
              <Slider
                value={lighting}
                onValueChange={setLighting}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Weather: {weather[0]}%
              </label>
              <Slider
                value={weather}
                onValueChange={setWeather}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Depth of Field: {depthOfField[0]}%
              </label>
              <Slider
                value={depthOfField}
                onValueChange={setDepthOfField}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Camera
              </label>
              <Select defaultValue="normal">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wide">Wide</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="tele">Tele</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

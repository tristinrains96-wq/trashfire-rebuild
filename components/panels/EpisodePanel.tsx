'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, Play, Download, Sparkles } from 'lucide-react'

const checklistItems = [
  { id: 1, label: 'Assets OK', status: true },
  { id: 2, label: 'Voices OK', status: true },
  { id: 3, label: 'Motion OK', status: false },
  { id: 4, label: 'Preview Ready', status: true },
]

const sparkEstimator = [
  { label: 'Character Generation', cost: 15 },
  { label: 'Background Rendering', cost: 8 },
  { label: 'Voice Synthesis', cost: 12 },
  { label: 'Motion Animation', cost: 20 },
  { label: 'Final Compilation', cost: 10 },
]

export default function EpisodePanel() {
  return (
    <div className="space-y-6 px-4">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Checklist */}
          <Card className="bg-surface">
            <CardHeader>
              <CardTitle className="text-lg">Production Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  {item.status ? (
                    <CheckCircle className="h-5 w-5 text-accent" />
                  ) : (
                    <Circle className="h-5 w-5 text-text-disabled" />
                  )}
                  <span className={`text-sm ${item.status ? 'text-text-primary' : 'text-text-disabled'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Spark Estimator */}
          <Card className="bg-surface">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Spark Estimator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sparkEstimator.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.cost} sparks
                  </Badge>
                </div>
              ))}
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-text-primary">Total</span>
                  <Badge variant="default" className="text-xs">
                    {sparkEstimator.reduce((sum, item) => sum + item.cost, 0)} sparks
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button variant="outline" className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            Preview 30s
          </Button>
          <Button className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Episode
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export 1080p
          </Button>
        </div>
      </div>
    </div>
  )
}

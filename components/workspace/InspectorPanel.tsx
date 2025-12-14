'use client'

import { Eye, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function InspectorPanel() {
  return (
    <div className="h-full flex flex-col p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-5 w-5 text-[#00ffea]" />
        <h2 className="text-lg font-semibold text-white">Inspector</h2>
      </div>

      <div className="space-y-4">
        <Card className={cn(
          "bg-[#0a0f15]/80 backdrop-blur-sm",
          "border border-white/10"
        )}>
          <CardHeader>
            <CardTitle className="text-sm text-white/80">Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-white/60">
              <div className="flex justify-between">
                <span>Position</span>
                <span className="text-white/80">0, 0</span>
              </div>
              <div className="flex justify-between">
                <span>Scale</span>
                <span className="text-white/80">100%</span>
              </div>
              <div className="flex justify-between">
                <span>Rotation</span>
                <span className="text-white/80">0°</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-[#0a0f15]/80 backdrop-blur-sm",
          "border border-white/10"
        )}>
          <CardHeader>
            <CardTitle className="text-sm text-white/80">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white/60">
              No item selected
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


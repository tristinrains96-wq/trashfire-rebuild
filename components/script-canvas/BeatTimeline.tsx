'use client'

import { useState } from 'react'
import { Clock, Target, MessageSquare } from 'lucide-react'
import { BeatModel } from '@/store/scriptLab'

interface BeatTimelineProps {
  beats: BeatModel[]
}

export default function BeatTimeline({ beats }: BeatTimelineProps) {
  const [hoveredBeat, setHoveredBeat] = useState<string | null>(null)

  if (!beats.length) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">No Beat Sheet Available</p>
          <p className="text-sm">Ask me to create a beat sheet to get started</p>
        </div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getBeatColor = (index: number) => {
    const colors = [
      'bg-teal-500',
      'bg-cyan-500', 
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500'
    ]
    return colors[index % colors.length]
  }

  const getBeatSize = (index: number) => {
    // Key beats are larger
    const keyBeats = [0, 5, 9, 13] // Opening, Midpoint, All is Lost, Finale
    return keyBeats.includes(index) ? 'w-4 h-4' : 'w-3 h-3'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Beat Sheet</h2>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Total: {formatTime(beats[beats.length - 1]?.tSec || 0)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{beats.length} Beats</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-400 via-cyan-400 to-blue-400"></div>

        {/* Beats */}
        <div className="space-y-8">
          {beats.map((beat, index) => (
            <div
              key={beat.id}
              className="relative flex items-start gap-6"
              onMouseEnter={() => setHoveredBeat(beat.id)}
              onMouseLeave={() => setHoveredBeat(null)}
            >
              {/* Beat Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`${getBeatSize(index)} ${getBeatColor(index)} rounded-full border-2 border-white shadow-lg transition-all duration-200 ${
                    hoveredBeat === beat.id ? 'scale-125' : ''
                  }`}
                />
                
                {/* Time Label */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  {formatTime(beat.tSec)}
                </div>
              </div>

              {/* Beat Content */}
              <div className="flex-1 min-w-0">
                <div
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    hoveredBeat === beat.id
                      ? 'bg-teal-600/20 border-teal-400/50 shadow-lg'
                      : 'bg-gray-800/50 border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{beat.label}</h3>
                    <div className="text-sm text-teal-400 font-mono">
                      {formatTime(beat.tSec)}
                    </div>
                  </div>
                  
                  {beat.note && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300">{beat.note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <h4 className="text-sm font-semibold text-white mb-3">Beat Types</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            <span className="text-gray-300">Setup & Opening</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <span className="text-gray-300">Rising Action</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">Midpoint</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <span className="text-gray-300">Climax & Resolution</span>
          </div>
        </div>
      </div>
    </div>
  )
}

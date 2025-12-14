'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock, MapPin } from 'lucide-react'
import { OutlineModel } from '@/store/scriptLab'

interface OutlineTreeProps {
  outline: OutlineModel | null
}

export default function OutlineTree({ outline }: OutlineTreeProps) {
  const [expandedActs, setExpandedActs] = useState<Set<number>>(new Set([0]))
  const [expandedSequences, setExpandedSequences] = useState<Set<string>>(new Set())

  if (!outline) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">No Outline Available</p>
          <p className="text-sm">Ask me to create an outline to get started</p>
        </div>
      </div>
    )
  }

  const toggleAct = (actIndex: number) => {
    const newExpanded = new Set(expandedActs)
    if (newExpanded.has(actIndex)) {
      newExpanded.delete(actIndex)
    } else {
      newExpanded.add(actIndex)
    }
    setExpandedActs(newExpanded)
  }

  const toggleSequence = (sequenceKey: string) => {
    const newExpanded = new Set(expandedSequences)
    if (newExpanded.has(sequenceKey)) {
      newExpanded.delete(sequenceKey)
    } else {
      newExpanded.add(sequenceKey)
    }
    setExpandedSequences(newExpanded)
  }

  const getTotalDuration = () => {
    let total = 0
    outline.acts.forEach(act => {
      act.sequences.forEach(sequence => {
        sequence.scenes.forEach(scene => {
          total += scene.estSec
        })
      })
    })
    return total
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Story Outline</h2>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Total: {formatDuration(getTotalDuration())}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{outline.acts.length} Acts</span>
          </div>
        </div>
      </div>

      {/* Acts */}
      <div className="space-y-4">
        {outline.acts.map((act, actIndex) => {
          const isActExpanded = expandedActs.has(actIndex)
          const actDuration = act.sequences.reduce((total, seq) => 
            total + seq.scenes.reduce((seqTotal, scene) => seqTotal + scene.estSec, 0), 0
          )

          return (
            <div key={actIndex} className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Act Header */}
              <button
                onClick={() => toggleAct(actIndex)}
                className="w-full p-4 bg-gray-800 hover:bg-gray-750 transition-colors text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {isActExpanded ? (
                    <ChevronDown className="h-5 w-5 text-teal-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-teal-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{act.title}</h3>
                    <p className="text-sm text-gray-400">
                      {act.sequences.length} sequences • {formatDuration(actDuration)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {formatDuration(actDuration)}
                </div>
              </button>

              {/* Act Content */}
              {isActExpanded && (
                <div className="p-4 bg-gray-900/50">
                  {act.sequences.map((sequence, seqIndex) => {
                    const sequenceKey = `${actIndex}-${seqIndex}`
                    const isSequenceExpanded = expandedSequences.has(sequenceKey)
                    const sequenceDuration = sequence.scenes.reduce((total, scene) => total + scene.estSec, 0)

                    return (
                      <div key={seqIndex} className="mb-4 last:mb-0">
                        {/* Sequence Header */}
                        <button
                          onClick={() => toggleSequence(sequenceKey)}
                          className="w-full p-3 bg-gray-700 hover:bg-gray-650 rounded-lg transition-colors text-left flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {isSequenceExpanded ? (
                              <ChevronDown className="h-4 w-4 text-teal-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-teal-400" />
                            )}
                            <div>
                              <h4 className="font-medium text-white">{sequence.title}</h4>
                              <p className="text-xs text-gray-400">
                                {sequence.scenes.length} scenes • {formatDuration(sequenceDuration)}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDuration(sequenceDuration)}
                          </div>
                        </button>

                        {/* Sequence Content */}
                        {isSequenceExpanded && (
                          <div className="mt-2 space-y-2">
                            {sequence.scenes.map((scene, sceneIndex) => (
                              <div
                                key={scene.id}
                                className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium text-white">{scene.title}</h5>
                                    <p className="text-xs text-gray-400">Scene {sceneIndex + 1}</p>
                                  </div>
                                  <div className="text-sm text-teal-400 font-mono">
                                    {formatDuration(scene.estSec)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

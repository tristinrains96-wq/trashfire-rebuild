'use client'

import { useState } from 'react'
import { Clock, MapPin, Users, Sun, Moon, Sunset } from 'lucide-react'
import { SceneCardModel } from '@/store/scriptLab'

interface SceneCardsProps {
  cards: SceneCardModel[]
}

export default function SceneCards({ cards }: SceneCardsProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  if (!cards.length) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">No Scene Cards Available</p>
          <p className="text-sm">Ask me to create scene cards to get started</p>
        </div>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'Day':
        return <Sun className="h-4 w-4 text-yellow-400" />
      case 'Night':
        return <Moon className="h-4 w-4 text-blue-400" />
      case 'Sunset':
        return <Sunset className="h-4 w-4 text-orange-400" />
      default:
        return <Sun className="h-4 w-4 text-gray-400" />
    }
  }

  const getTimeColor = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'Day':
        return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30'
      case 'Night':
        return 'bg-blue-400/20 text-blue-300 border-blue-400/30'
      case 'Sunset':
        return 'bg-orange-400/20 text-orange-300 border-orange-400/30'
      default:
        return 'bg-gray-400/20 text-gray-300 border-gray-400/30'
    }
  }

  const getTotalDuration = () => {
    return cards.reduce((total, card) => total + card.estSec, 0)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Scene Cards</h2>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Total: {formatDuration(getTotalDuration())}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{cards.length} Scenes</span>
          </div>
        </div>
      </div>

      {/* Scene Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
              selectedCard === card.id
                ? 'bg-teal-600/20 border-teal-400/50 shadow-lg scale-105'
                : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50'
            }`}
            onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
          >
            {/* Scene Number & Title */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-gray-400 mb-1">Scene {index + 1}</div>
                <h3 className="font-semibold text-white text-lg">{card.title}</h3>
              </div>
              <div className="text-sm text-teal-400 font-mono">
                {formatDuration(card.estSec)}
              </div>
            </div>

            {/* Location & Time */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{card.location}</span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getTimeColor(card.timeOfDay)}`}>
                {getTimeIcon(card.timeOfDay)}
                <span>{card.timeOfDay}</span>
              </div>
            </div>

            {/* Speakers */}
            {card.speakers.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Speakers</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {card.speakers.map((speaker, speakerIndex) => (
                    <span
                      key={speakerIndex}
                      className="px-2 py-1 bg-teal-600/20 text-teal-300 text-xs rounded-full border border-teal-400/30"
                    >
                      {speaker}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Expanded Content */}
            {selectedCard === card.id && (
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="text-sm text-gray-300">
                  <p className="mb-2">
                    <strong>Duration:</strong> {formatDuration(card.estSec)}
                  </p>
                  <p className="mb-2">
                    <strong>Setting:</strong> {card.location} ({card.timeOfDay})
                  </p>
                  <p>
                    <strong>Characters:</strong> {card.speakers.join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <h4 className="text-sm font-semibold text-white mb-3">Scene Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-teal-400">{cards.length}</div>
            <div className="text-gray-400">Total Scenes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-cyan-400">{formatDuration(getTotalDuration())}</div>
            <div className="text-gray-400">Total Duration</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">
              {Math.round(getTotalDuration() / cards.length)}
            </div>
            <div className="text-gray-400">Avg Duration (s)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">
              {new Set(cards.map(c => c.location)).size}
            </div>
            <div className="text-gray-400">Unique Locations</div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import CharacterTimeline from '@/components/CharacterTimeline'
import CharacterDNASidebar from '@/components/CharacterDNASidebar'

interface CharacterVersion {
  id: string
  version: string
  seed: number
  mood: string
  thumbnail: string
  isCanon?: boolean
}

const mockVersions: CharacterVersion[] = [
  { id: '1', version: '1.0', seed: 1234, mood: 'Calm', thumbnail: '', isCanon: true },
  { id: '2', version: '1.1', seed: 2345, mood: 'Excited', thumbnail: '' },
  { id: '3', version: '1.2', seed: 3456, mood: 'Serious', thumbnail: '' },
  { id: '4', version: '2.0', seed: 4567, mood: 'Playful', thumbnail: '' },
  { id: '5', version: '2.1', seed: 5678, mood: 'Mysterious', thumbnail: '' },
]

export default function CharactersPanel() {
  const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>()
  const [showDNA, setShowDNA] = useState(false)

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersionId(versionId)
  }

  const handleAssist = async (action: any) => {
    console.log('Assist action:', action)
    try {
      const response = await fetch('/api/brain/character-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action.action,
          characterId: selectedVersionId,
        }),
      })
      const result = await response.json()
      console.log('Assist result:', result)
    } catch (error) {
      console.error('Assist error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Character Timeline - Only show if there are versions */}
      {mockVersions.length > 0 && (
        <div className="px-4">
          <CharacterTimeline
            versions={mockVersions}
            selectedVersionId={selectedVersionId}
            onSelect={handleVersionSelect}
            onSetCanon={(id) => console.log('Set canon:', id)}
            onDuplicate={(id) => console.log('Duplicate:', id)}
            onRename={(id) => console.log('Rename:', id)}
            onDelete={(id) => console.log('Delete:', id)}
          />
        </div>
      )}

      {/* DNA Sidebar */}
      <CharacterDNASidebar
        isOpen={showDNA}
        onClose={() => setShowDNA(false)}
      />
    </div>
  )
}

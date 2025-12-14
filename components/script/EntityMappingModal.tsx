'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Character, Background } from '@/lib/mockAssets'

interface EntityMappingModalProps {
  isOpen: boolean
  onClose: () => void
  detectedCharacters: string[]
  detectedLocations: string[]
  userCharacters: Character[]
  userBackgrounds: Background[]
  onSave: (mapping: { characters: Record<string, string>, locations: Record<string, string> }) => void
}

export default function EntityMappingModal({
  isOpen,
  onClose,
  detectedCharacters,
  detectedLocations,
  userCharacters,
  userBackgrounds,
  onSave
}: EntityMappingModalProps) {
  const [characterMapping, setCharacterMapping] = useState<Record<string, string>>({})
  const [locationMapping, setLocationMapping] = useState<Record<string, string>>({})

  const handleSave = () => {
    onSave({
      characters: characterMapping,
      locations: locationMapping
    })
    onClose()
  }

  const handleCharacterChange = (detectedName: string, assetId: string) => {
    setCharacterMapping(prev => ({
      ...prev,
      [detectedName]: assetId
    }))
  }

  const handleLocationChange = (detectedLocation: string, bgId: string) => {
    setLocationMapping(prev => ({
      ...prev,
      [detectedLocation]: bgId
    }))
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-text-primary">
              Entity Mapping
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Characters Section */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Characters</h3>
              <div className="space-y-4">
                {detectedCharacters.map((character) => (
                  <div key={character} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <span className="text-text-primary font-medium">{character}</span>
                    <Select
                      value={characterMapping[character] || ""}
                      onValueChange={(value) => handleCharacterChange(character, value)}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select asset or auto-generate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-generate placeholder</SelectItem>
                        {userCharacters.map((char) => (
                          <SelectItem key={char.id} value={char.id}>
                            <div className="flex items-center gap-2">
                              <img 
                                src={char.thumb} 
                                alt={char.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                              {char.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations Section */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Locations</h3>
              <div className="space-y-4">
                {detectedLocations.map((location) => (
                  <div key={location} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <span className="text-text-primary font-medium">{location}</span>
                    <Select
                      value={locationMapping[location] || ""}
                      onValueChange={(value) => handleLocationChange(location, value)}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select background or auto-generate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-generate placeholder</SelectItem>
                        {userBackgrounds.map((bg) => (
                          <SelectItem key={bg.id} value={bg.id}>
                            <div className="flex items-center gap-2">
                              <img 
                                src={bg.thumb} 
                                alt={bg.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                              {bg.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Mapping
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MoreHorizontal, Copy, Edit, Trash2, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface CharacterVersion {
  id: string
  version: string
  seed: number
  mood: string
  thumbnail: string
  isCanon?: boolean
}

interface CharacterTimelineProps {
  versions: CharacterVersion[]
  selectedVersionId?: string
  onSelect: (versionId: string) => void
  onSetCanon: (versionId: string) => void
  onDuplicate: (versionId: string) => void
  onRename: (versionId: string) => void
  onDelete: (versionId: string) => void
}

export default function CharacterTimeline({
  versions,
  selectedVersionId,
  onSelect,
  onSetCanon,
  onDuplicate,
  onRename,
  onDelete
}: CharacterTimelineProps) {
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null)

  const handleKebabClick = (e: React.MouseEvent, versionId: string) => {
    e.stopPropagation()
    // In a real app, this would open a dropdown menu
    console.log('Kebab menu clicked for version:', versionId)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Version Timeline</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {versions.map((version) => {
          const isSelected = version.id === selectedVersionId
          const isHovered = hoveredVersion === version.id
          
          return (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`
                  bg-surface cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'ring-2 ring-accent shadow-glow' 
                    : 'hover:shadow-md hover:ring-1 hover:ring-border'
                  }
                `}
                onClick={() => onSelect(version.id)}
                onMouseEnter={() => setHoveredVersion(version.id)}
                onMouseLeave={() => setHoveredVersion(null)}
              >
                <CardContent className="p-3">
                  {/* Thumbnail */}
                  <div className="aspect-square bg-border rounded mb-2 flex items-center justify-center relative overflow-hidden">
                    {version.thumbnail ? (
                      <img 
                        src={version.thumbnail} 
                        alt={`Version ${version.version}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-text-secondary">v{version.version}</span>
                    )}
                    
                    {/* Canon badge */}
                    {version.isCanon && (
                      <div className="absolute top-1 right-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      </div>
                    )}
                  </div>
                  
                  {/* Version info */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-secondary">v{version.version}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleKebabClick(e, version.id)}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-text-disabled">
                      <div>Seed {version.seed}</div>
                      <div className="capitalize">{version.mood}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      
      {/* Empty state */}
      {versions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-text-secondary">No character versions yet</p>
          <p className="text-text-disabled text-sm mt-1">Generate your first character to get started</p>
        </div>
      )}
    </div>
  )
}

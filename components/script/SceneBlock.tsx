'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { SceneBlock as SceneBlockType, ScriptLine } from '@/types'
import { useWorkspace } from '@/store/workspace'

interface SceneBlockProps {
  scene: SceneBlockType
  onUpdate: (sceneId: string, updates: Partial<SceneBlockType>) => void
  onDelete: (sceneId: string) => void
  onAddBeat: (sceneId: string) => void
}

export default function SceneBlock({ scene, onUpdate, onDelete, onAddBeat }: SceneBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingLine, setEditingLine] = useState<number | null>(null)
  const [newLineText, setNewLineText] = useState('')

  const handleLineUpdate = (lineIndex: number, updates: Partial<ScriptLine>) => {
    const updatedLines = [...scene.lines]
    updatedLines[lineIndex] = { ...updatedLines[lineIndex], ...updates }
    onUpdate(scene.id, { lines: updatedLines })
  }

  const handleAddLine = () => {
    if (newLineText.trim()) {
      const newLine: ScriptLine = {
        text: newLineText.trim(),
        character: undefined
      }
      onUpdate(scene.id, { lines: [...scene.lines, newLine] })
      setNewLineText('')
    }
  }

  const handleDeleteLine = (lineIndex: number) => {
    const updatedLines = scene.lines.filter((_, index) => index !== lineIndex)
    onUpdate(scene.id, { lines: updatedLines })
  }

  const handleTitleUpdate = (newTitle: string) => {
    onUpdate(scene.id, { title: newTitle })
  }

  const handleLocationUpdate = (newLocation: string) => {
    onUpdate(scene.id, { location: newLocation })
  }

  const handleTimeUpdate = (newTime: string) => {
    onUpdate(scene.id, { timeOfDay: newTime })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 mb-4"
    >
      {/* Scene Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <input
              type="text"
              value={scene.title}
              onChange={(e) => handleTitleUpdate(e.target.value)}
              className="bg-transparent border-b border-teal-500/50 text-lg font-semibold text-white focus:outline-none focus:border-teal-400"
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              autoFocus
            />
          ) : (
            <h3 
              className="text-lg font-semibold text-white cursor-pointer hover:text-teal-300 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {scene.title}
            </h3>
          )}
          
          {/* Location and Time chips */}
          <div className="flex gap-2">
            {scene.location && (
              <Badge variant="secondary" className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                {scene.location}
              </Badge>
            )}
            {scene.timeOfDay && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {scene.timeOfDay}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddBeat(scene.id)}
            className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Beat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(scene.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scene Lines */}
      <div className="space-y-3">
        {scene.lines.map((line, index) => (
          <div key={index} className="flex items-start gap-3 group">
            {/* Character tag */}
            <div className="w-20 flex-shrink-0">
              {editingLine === index ? (
                <input
                  type="text"
                  value={line.character || ''}
                  onChange={(e) => handleLineUpdate(index, { character: e.target.value })}
                  placeholder="Character"
                  className="w-full bg-transparent border-b border-teal-500/50 text-sm text-teal-300 focus:outline-none focus:border-teal-400"
                  onBlur={() => setEditingLine(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingLine(null)}
                />
              ) : (
                <button
                  onClick={() => setEditingLine(index)}
                  className="text-sm text-teal-300 hover:text-teal-200 transition-colors text-left"
                >
                  {line.character || 'NARRATOR'}
                </button>
              )}
            </div>

            {/* Line text */}
            <div className="flex-1">
              {editingLine === index ? (
                <Textarea
                  value={line.text}
                  onChange={(e) => handleLineUpdate(index, { text: e.target.value })}
                  className="bg-transparent border-teal-500/50 text-white resize-none min-h-[2rem]"
                  onBlur={() => setEditingLine(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      setEditingLine(null)
                    }
                  }}
                  autoFocus
                />
              ) : (
                <p 
                  className="text-white cursor-pointer hover:text-teal-100 transition-colors min-h-[2rem] flex items-center"
                  onClick={() => setEditingLine(index)}
                >
                  {line.text}
                </p>
              )}
            </div>

            {/* Line actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingLine(index)}
                className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteLine(index)}
                className="h-6 w-6 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add new line */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-20 flex-shrink-0">
            <input
              type="text"
              value={newLineText}
              onChange={(e) => setNewLineText(e.target.value)}
              placeholder="Character"
              className="w-full bg-transparent border-b border-white/20 text-sm text-white/60 focus:outline-none focus:border-teal-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAddLine()}
            />
          </div>
          <div className="flex-1">
            <Textarea
              value={newLineText}
              onChange={(e) => setNewLineText(e.target.value)}
              placeholder="Add a new line..."
              className="bg-transparent border-white/20 text-white/60 resize-none min-h-[2rem]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddLine()
                }
              }}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddLine}
            disabled={!newLineText.trim()}
            className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}


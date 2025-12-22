'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { SlotItem } from '@/lib/demo/projectLabTypes'

interface SlotEditModalProps {
  isOpen: boolean
  slot: SlotItem | null
  onClose: () => void
  onSave: (slotId: string, prompt: string) => void
}

export default function SlotEditModal({ isOpen, slot, onClose, onSave }: SlotEditModalProps) {
  const [prompt, setPrompt] = useState('')

  useEffect(() => {
    if (slot) {
      setPrompt(slot.prompt || '')
    }
  }, [slot])

  const handleSave = () => {
    if (slot) {
      onSave(slot.id, prompt)
      onClose()
    }
  }

  if (!slot) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                'relative w-full max-w-md rounded-lg',
                'bg-[#0a0f15] border border-white/20',
                'shadow-[0_0_40px_rgba(0,255,234,0.2)]',
                'p-6'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Edit {slot.title}</h3>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Prompt
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter prompt for this slot..."
                  className={cn(
                    'min-h-[120px] bg-[#07090a] border-white/10',
                    'text-white placeholder:text-white/40',
                    'focus:border-[#00ffea] focus:ring-[#00ffea]/20'
                  )}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-[#00ffea] hover:bg-[#00e6d1] text-black font-semibold"
                >
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


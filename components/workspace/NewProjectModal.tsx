'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProjectData) => void
}

interface ProjectData {
  name: string
  description?: string
  tone: {
    brightness: number
    saturation: number
    contrast: number
    warmth: number
  }
}

export default function NewProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: NewProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tone, setTone] = useState({
    brightness: 50,
    saturation: 50,
    contrast: 50,
    warmth: 50,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, description, tone })
    setName('')
    setDescription('')
    setTone({ brightness: 50, saturation: 50, contrast: 50, warmth: 50 })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className={cn(
              "w-full max-w-2xl",
              "bg-[#0a0f15]/95 backdrop-blur-xl",
              "border border-white/10",
              "shadow-[0_0_60px_rgba(0,255,234,0.2)]"
            )}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
                <CardTitle className="text-xl font-semibold text-white">
                  New Project
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Project Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter project name"
                      required
                      className={cn(
                        "bg-black/30 border-white/10",
                        "focus:border-[#00ffea] focus:ring-[#00ffea]/20",
                        "text-white placeholder:text-white/40"
                      )}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Description (Optional)
                    </label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of your project"
                      className={cn(
                        "bg-black/30 border-white/10",
                        "focus:border-[#00ffea] focus:ring-[#00ffea]/20",
                        "text-white placeholder:text-white/40"
                      )}
                    />
                  </div>

                  {/* Tone Sliders */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white/90 mb-4">
                      Visual Tone
                    </h3>

                    {[
                      { key: 'brightness', label: 'Brightness', value: tone.brightness },
                      { key: 'saturation', label: 'Saturation', value: tone.saturation },
                      { key: 'contrast', label: 'Contrast', value: tone.contrast },
                      { key: 'warmth', label: 'Warmth', value: tone.warmth },
                    ].map(({ key, label, value }) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-white/70">{label}</label>
                          <span className="text-sm text-[#00ffea] font-mono">{value}</span>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={([val]) =>
                            setTone((prev) => ({ ...prev, [key]: val }))
                          }
                          min={0}
                          max={100}
                          step={1}
                          className="[&_[role=slider]]:bg-[#00ffea] [&_[role=slider]]:shadow-[0_0_8px_rgba(0,255,234,0.5)]"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      className="flex-1 border border-white/10 hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className={cn(
                        "flex-1",
                        "bg-[#00ffea] hover:bg-[#00e6d1]",
                        "text-black font-semibold",
                        "shadow-[0_0_20px_rgba(0,255,234,0.3)]",
                        "hover:shadow-[0_0_30px_rgba(0,255,234,0.5)]"
                      )}
                    >
                      Create Project
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


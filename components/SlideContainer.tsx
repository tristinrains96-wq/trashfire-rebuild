'use client'

import { motion, AnimatePresence } from 'framer-motion'
import CharactersPanel from './panels/CharactersPanel'
import BackgroundsPanel from './panels/BackgroundsPanel'
import VoicesPanel from './panels/VoicesPanel'
import ScenesPanel from './panels/ScenesPanel'
import MusicPanel from './panels/MusicPanel'
import EpisodePanel from './panels/EpisodePanel'

const panels = [
  { id: 'characters', label: 'Characters', component: CharactersPanel },
  { id: 'backgrounds', label: 'Backgrounds', component: BackgroundsPanel },
  { id: 'voices', label: 'Voices', component: VoicesPanel },
  { id: 'scenes', label: 'Scenes', component: ScenesPanel },
  { id: 'music', label: 'Music', component: MusicPanel },
  { id: 'episode', label: 'Episode', component: EpisodePanel },
]

interface SlideContainerProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function SlideContainer({ activeSection, onSectionChange }: SlideContainerProps) {
  return (
    <div className="w-full">
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {panels.map((panel) => {
            if (panel.id !== activeSection) return null
            const Component = panel.component
            return (
              <motion.div
                key={panel.id}
                id={`panel-${panel.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Component />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

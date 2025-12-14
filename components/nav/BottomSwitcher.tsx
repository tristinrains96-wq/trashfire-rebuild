'use client'

import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, Users, Image, Mic, Film, Music } from 'lucide-react'

interface BottomSwitcherProps {
  className?: string
}

const sections = [
  { key: 'script', label: 'Script', icon: FileText, path: '/workspace?section=script' },
  { key: 'characters', label: 'Characters', icon: Users, path: '/workspace?section=characters' },
  { key: 'backgrounds', label: 'Backgrounds', icon: Image, path: '/workspace?section=backgrounds' },
  { key: 'voices', label: 'Voices', icon: Mic, path: '/workspace?section=voices' },
  { key: 'scenes', label: 'Scenes', icon: Film, path: '/workspace?section=scenes' },
  { key: 'episode', label: 'Episode', icon: Music, path: '/workspace?section=episode' }
]

export default function BottomSwitcher({ className = "" }: BottomSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const currentSection = pathname.split('/').pop() || 'script'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed bottom-20 left-0 right-0 z-30 px-4 ${className}`}
    >
      <div className="flex items-center justify-center max-w-[1100px] mx-auto">
        <div className="flex items-center gap-2 py-3 px-4 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/10">
          {sections.map((section, index) => {
            const isActive = currentSection === section.key
            const Icon = section.icon
            
            return (
              <motion.button
                key={section.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.05 
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`
                  relative flex items-center justify-center w-12 h-12 rounded-xl
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-cyan-300' 
                    : 'text-white/60 hover:text-white/85 hover:bg-white/5'
                  }
                `}
                onClick={() => router.push(section.path)}
                title={section.label}
              >
                <Icon className="h-5 w-5" />
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-switcher-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

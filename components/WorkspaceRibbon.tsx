'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useWorkspace } from '@/store/workspace'

const tabs = [
  { name: 'Script', href: '/workspace?section=script', key: 'script' },
  { name: 'Characters', href: '/workspace?section=characters', key: 'characters' },
  { name: 'Backgrounds', href: '/workspace?section=backgrounds', key: 'backgrounds' },
  { name: 'Voices', href: '/workspace?section=voices', key: 'voices' },
  { name: 'Scenes', href: '/workspace?section=scenes', key: 'scenes' },
  { name: 'Episode', href: '/workspace?section=episode', key: 'episode' },
]

export default function WorkspaceRibbon() {
  const path = usePathname()
  const { activeSection, setSection } = useWorkspace()
  
  return (
    <div className="sticky bottom-[var(--kb-height,88px)] z-40 w-full bg-transparent">
      <nav className="flex items-center justify-center gap-8 overflow-x-auto px-4 py-3 text-base font-display text-zinc-400">
        {tabs.map((tab) => {
          const active = activeSection === tab.key
          return (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={() => setSection(tab.key as any)}
              className={clsx(
                'relative transition-all duration-300 hover:text-white',
                active ? 'text-teal-300 font-semibold' : 'text-zinc-500'
              )}
            >
              {tab.name}
              {active && (
                <span
                  className="absolute -bottom-[2px] left-0 right-0 h-[3px] rounded-full
                  bg-gradient-to-r from-teal-400 via-lime-300 to-teal-400 shadow-[0_0_15px_rgba(0,255,204,0.4)]"
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

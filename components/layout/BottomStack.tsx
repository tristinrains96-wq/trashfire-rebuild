'use client'

import { ReactNode } from 'react'
import Keyboard from '@/components/workspace/Keyboard'

interface BottomStackProps {
  children?: ReactNode
}

export default function BottomStack({ children }: BottomStackProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      {/* Tabs/Ribbon */}
      <div className="pointer-events-auto mx-auto mb-2 w-full max-w-[920px]">
        {children}
      </div>
      {/* Keyboard */}
      <div className="pointer-events-auto border-t border-white/10 bg-[#0a0f15]/90 backdrop-blur
                      px-3 sm:px-4 py-2 sm:py-3
                      pb-[calc(env(safe-area-inset-bottom))]">
        <Keyboard />
      </div>
    </div>
  )
}

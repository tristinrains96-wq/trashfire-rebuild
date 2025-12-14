'use client'

import TopBar from '@/components/TopBar'
import PreviewBox from '@/components/PreviewBox'
import SectionRibbon from '@/components/SectionRibbon'
import BottomStack from '@/components/layout/BottomStack'

interface WorkspaceShellProps {
  children: React.ReactNode
  sections?: Array<{ key: string; label: string }>
  activeSection?: string
  onSectionChange?: (key: string) => void
}

export default function WorkspaceShell({ 
  children, 
  sections,
  activeSection,
  onSectionChange 
}: WorkspaceShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0C0D] text-white">
      <TopBar />
      <main className="flex flex-col items-center flex-1 pt-20 md:pt-24">
        <PreviewBox />
        {sections && activeSection && onSectionChange && (
          <SectionRibbon
            sections={sections}
            activeKey={activeSection}
            onChange={onSectionChange}
          />
        )}
        <div className="w-full max-w-[1100px] px-6 mt-8 pb-24">
          {children}
        </div>
      </main>
      <BottomStack />
    </div>
  )
}

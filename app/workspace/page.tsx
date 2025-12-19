'use client'

import { Suspense, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'

// Check if Clerk is enabled to determine correct sign-in URL
const CLERK_ENABLED = !!(
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...'
)

const getSignInUrl = () => CLERK_ENABLED ? '/sign-in' : '/login'

// Dynamic import for loading component to avoid SSR issues
const WorkspaceLoading = dynamic(() => import('@/components/workspace/WorkspaceLoading'), {
  ssr: false
})

// Dynamic imports for heavy components with client-only rendering
const TopBar = dynamic(() => import('@/components/TopBar'), {
  ssr: false,
  loading: () => null
})

const BackgroundFX = dynamic(() => import('@/components/layout/BackgroundFX'), {
  ssr: false,
  loading: () => null
})

const BottomStack = dynamic(() => import('@/components/layout/BottomStack'), {
  ssr: false,
  loading: () => null
})

const StudioInit = dynamic(() => import('@/components/studio/StudioInit'), {
  ssr: false
})

const ProWorkspaceLayout = dynamic(() => import('@/components/workspace/ProWorkspaceLayout'), {
  ssr: false,
  loading: () => null
})

const WorkspaceCanvas = dynamic(() => import('@/components/workspace/WorkspaceCanvas'), {
  ssr: false,
  loading: () => null
})

const AssetSidebar = dynamic(() => import('@/components/workspace/AssetSidebar'), {
  ssr: false,
  loading: () => null
})

const InspectorPanel = dynamic(() => import('@/components/workspace/InspectorPanel'), {
  ssr: false,
  loading: () => null
})

const SectionRibbon = dynamic(() => import('@/components/workspace/SectionRibbon'), {
  ssr: false,
  loading: () => null
})

const NewProjectModal = dynamic(() => import('@/components/workspace/NewProjectModal'), {
  ssr: false
})

const ProgressBar = dynamic(() => import('@/components/workspace/ProgressBar'), {
  ssr: false
})

function WorkspaceContent() {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [activeRender, setActiveRender] = useState<{ episodeId: string; jobId: string } | null>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      const signInUrl = getSignInUrl()
      router.push(`${signInUrl}?redirect_url=/workspace`)
    }
  }, [isAuthenticated, router])

  const handleNewProject = (data: any) => {
    console.log('New project:', data)
    // TODO: Create project
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <StudioInit />
      <div className="min-h-screen bg-[#07090a] overflow-hidden">
        {/* Fixed TopBar */}
        <TopBar />
        
        {/* Background Effects */}
        <BackgroundFX />
        
        {/* Pro Workspace Layout */}
        <ProWorkspaceLayout
          leftPanel={<AssetSidebar type="tree" />}
          rightPanel={<InspectorPanel />}
          centerContent={
            <div className="h-full flex flex-col p-4">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-white">Canvas</h1>
                <Button
                  onClick={() => setShowNewProjectModal(true)}
                  className={cn(
                    "bg-[#00ffea] hover:bg-[#00e6d1]",
                    "text-black font-semibold",
                    "shadow-[0_0_20px_rgba(0,255,234,0.3)]",
                    "hover:shadow-[0_0_30px_rgba(0,255,234,0.5)]",
                    "transition-all duration-300"
                  )}
                  style={{
                    boxShadow: '0 0 20px rgba(0,255,234,0.3), 0 0 40px rgba(0,255,234,0.1)'
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <WorkspaceCanvas />
              </div>
              {/* Progress Bar for active renders */}
              {activeRender && (
                <div className="mt-4">
                  <ProgressBar
                    episodeId={activeRender.episodeId}
                    jobId={activeRender.jobId}
                    onComplete={(result) => {
                      console.log('Render complete:', result)
                      setActiveRender(null)
                    }}
                    onError={(error) => {
                      console.error('Render error:', error)
                      setActiveRender(null)
                    }}
                  />
                </div>
              )}
            </div>
          }
        />

        {/* Bottom Stack with Section Ribbon (desktop only) */}
        <div className="hidden md:block">
          <BottomStack>
            <Suspense fallback={<div className="h-16" />}>
              <SectionRibbon />
            </Suspense>
          </BottomStack>
        </div>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onSubmit={handleNewProject}
      />
    </>
  )
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <WorkspaceContent />
    </Suspense>
  )
}

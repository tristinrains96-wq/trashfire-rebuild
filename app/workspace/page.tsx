'use client'

import { Suspense, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { ProjectLabState, SelectedTarget } from '@/lib/demo/projectLabTypes'
import { createDefaultProjectLabState } from '@/lib/demo/projectLabSeed'
import type { WorkspaceMode } from '@/components/workspace/ModeSwitcher'

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

const ProjectLab = dynamic(() => import('@/components/workspace/ProjectLab'), {
  ssr: false,
  loading: () => null
})

const GuidedSteps = dynamic(() => import('@/components/workspace/GuidedSteps'), {
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

const PlanModeContent = dynamic(() => import('@/components/workspace/PlanModeContent'), {
  ssr: false
})

const BuildModeContent = dynamic(() => import('@/components/workspace/BuildModeContent'), {
  ssr: false
})

const PreviewModeContent = dynamic(() => import('@/components/workspace/PreviewModeContent'), {
  ssr: false
})

const ModeSwitcher = dynamic(() => import('@/components/workspace/ModeSwitcher'), {
  ssr: false,
  loading: () => null
})

function WorkspaceContent() {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [activeRender, setActiveRender] = useState<{ episodeId: string; jobId: string } | null>(null)
  const [projectLabState, setProjectLabState] = useState<ProjectLabState>(() =>
    createDefaultProjectLabState()
  )
  const [mode, setMode] = useState<WorkspaceMode>('plan')
  const [isClient, setIsClient] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [selected, setSelected] = useState<SelectedTarget>(null)
  
  const { isAuthenticated, setUser } = useAuth()
  const router = useRouter()

  // Initialize client and check demo mode
  useEffect(() => {
    setIsClient(true)
    
    // Check if we're in demo mode and auto-authenticate
    if (typeof window !== 'undefined') {
      try {
        const { isDemoMode, DEMO_USER } = require('@/lib/demoAuth')
        if (isDemoMode() && !isAuthenticated) {
          setUser(DEMO_USER)
        }
      } catch (e) {
        console.warn('Failed to load demo auth:', e)
      }
      
      // Load mode from localStorage
      const saved = localStorage.getItem('workspace-mode')
      if (saved === 'plan' || saved === 'build' || saved === 'preview') {
        setMode(saved)
      }
      
      setAuthInitialized(true)
    }
  }, [isAuthenticated, setUser])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('workspace-mode', mode)
    }
  }, [mode])

  const handleUpdateProjectLabState = (updates: Partial<ProjectLabState>) => {
    setProjectLabState((prev) => ({ ...prev, ...updates }))
  }

  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      const signInUrl = getSignInUrl()
      router.push(`${signInUrl}?redirect_url=/workspace`)
    }
  }, [isAuthenticated, router, authInitialized])

  const handleNewProject = (data: any) => {
    console.log('New project:', data)
    // TODO: Create project
  }

  // Show loading while initializing
  if (!isClient || !authInitialized) {
    return <WorkspaceLoading />
  }

  // Show loading while redirecting if not authenticated
  if (!isAuthenticated) {
    return <WorkspaceLoading />
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
          leftPanel={
            <ProjectLab
              projectLabState={projectLabState}
              onUpdateState={handleUpdateProjectLabState}
              selected={selected}
              onSelect={(target) => setSelected(target)}
            />
          }
          rightPanel={
            <InspectorPanel
              selected={selected}
              projectLabState={projectLabState}
              onUpdateState={handleUpdateProjectLabState}
              onClearSelection={() => setSelected(null)}
            />
          }
          centerContent={
            <div className="h-full flex flex-col p-4">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-white">Workspace</h1>
                <div className="flex items-center gap-3">
                  <Suspense fallback={<div className="w-32 h-8 bg-white/5 rounded-lg animate-pulse" />}>
                    <ModeSwitcher mode={mode} onModeChange={setMode} />
                  </Suspense>
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
              </div>

              {/* Guided Steps - Only show in Plan mode */}
              {mode === 'plan' && (
                <div className="mb-4">
                  <GuidedSteps
                    projectLabState={projectLabState}
                    onUpdateState={handleUpdateProjectLabState}
                  />
                </div>
              )}

              {/* Mode-Specific Content */}
              {mode === 'plan' ? (
                <PlanModeContent
                  projectLabState={projectLabState}
                  onUpdateState={handleUpdateProjectLabState}
                />
              ) : mode === 'build' ? (
                <BuildModeContent
                  projectLabState={projectLabState}
                  onUpdateState={handleUpdateProjectLabState}
                  selected={selected}
                  onSelect={(target) => setSelected(target)}
                />
              ) : mode === 'preview' ? (
                <PreviewModeContent
                  projectLabState={projectLabState}
                  selected={selected}
                  onSelect={(target) => setSelected(target)}
                />
              ) : (
                <PlanModeContent
                  projectLabState={projectLabState}
                  onUpdateState={handleUpdateProjectLabState}
                />
              )}

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

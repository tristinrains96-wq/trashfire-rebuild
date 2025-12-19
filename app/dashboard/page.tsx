'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, MoreVertical, Calendar, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Check if Clerk is enabled to determine correct sign-in URL
const CLERK_ENABLED = !!(
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...'
)

const getSignInUrl = () => CLERK_ENABLED ? '/sign-in' : '/login'

// Mock projects data
const mockProjects = [
  {
    id: '1',
    title: 'Epic Battle Scene',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '2024-01-15T10:30:00Z',
    type: 'episode',
    status: 'active',
  },
  {
    id: '2',
    title: 'Character Design',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '2024-01-14T15:20:00Z',
    type: 'character',
    status: 'active',
  },
  {
    id: '3',
    title: 'Background Set',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '2024-01-12T09:15:00Z',
    type: 'background',
    status: 'draft',
  },
  {
    id: '4',
    title: 'Voice Casting',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '2024-01-10T14:45:00Z',
    type: 'voice',
    status: 'active',
  },
  {
    id: '5',
    title: 'Scene Builder',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '2024-01-08T11:20:00Z',
    type: 'scene',
    status: 'completed',
  },
  {
    id: '6',
    title: 'Music Composition',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '2024-01-05T16:30:00Z',
    type: 'music',
    status: 'draft',
  },
]

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [projects] = useState(mockProjects)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(getSignInUrl())
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-[#07090a]">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#0a0f15]/95 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/trashfire-logo.png"
              alt="TrashFire"
              width={160}
              height={48}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/workspace">
              <Button variant="ghost" className="text-white/80 hover:text-white">
                Workspace
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
                <div className="h-8 w-8 rounded-full bg-[#00ffea]/20 flex items-center justify-center">
                  <span className="text-[#00ffea] text-sm font-medium">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-white/60">Manage your anime creation projects</p>
          </div>
          <Button
            onClick={() => router.push('/workspace')}
            className={cn(
              "bg-[#00ffea] hover:bg-[#00e6d1]",
              "text-black font-semibold",
              "shadow-[0_0_20px_rgba(0,255,234,0.3)]"
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10 bg-[#0a0f15]/80 border-white/10",
                "text-white placeholder:text-white/40",
                "focus:border-[#00ffea] focus:ring-[#00ffea]/20"
              )}
            />
          </div>
          <Button variant="outline" size="icon" className="border-white/10 text-white/80">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <Folder className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-2">No projects found</p>
            <p className="text-white/40 text-sm">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/workspace?project=${project.id}`}>
                  <Card className={cn(
                    "overflow-hidden cursor-pointer group h-full flex flex-col",
                    "bg-[#0a0f15]/80 backdrop-blur-sm",
                    "border border-white/10",
                    "hover:border-[#00ffea]/50",
                    "hover:shadow-[0_0_20px_rgba(0,255,234,0.2)]",
                    "transition-all duration-300"
                  )}>
                    <div className="relative aspect-video bg-gradient-to-br from-[#00ffea]/10 to-transparent flex items-center justify-center">
                      <Image
                        src={project.thumbnail}
                        alt={project.title}
                        fill
                        className="object-contain opacity-50 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          project.status === 'active' && "bg-[#00ffea]/20 text-[#00ffea]",
                          project.status === 'draft' && "bg-white/10 text-white/60",
                          project.status === 'completed' && "bg-green-500/20 text-green-400"
                        )}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#00ffea] transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-white/40 mt-auto">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(project.lastEdited)}</span>
                        </div>
                        <span className="capitalize">{project.type}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


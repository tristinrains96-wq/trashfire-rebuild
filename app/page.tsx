'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, Film, Users, Image as ImageIcon, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { useRouter } from 'next/navigation'

// Mock recent projects data
const recentProjects = [
  {
    id: '1',
    title: 'Epic Battle Scene',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '2 hours ago',
    type: 'episode',
  },
  {
    id: '2',
    title: 'Character Design',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '1 day ago',
    type: 'character',
  },
  {
    id: '3',
    title: 'Background Set',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '3 days ago',
    type: 'background',
  },
]

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleStartProject = () => {
    if (isAuthenticated) {
      router.push('/workspace')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#07090a] relative overflow-hidden" style={{ color: '#ffffff' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,234,0.1)_0%,transparent_60%)]" />
        <div className="absolute left-1/2 top-1/2 h-[200vh] w-[200vw] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_180deg,rgba(0,255,200,0.03),transparent_30%)] blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/trashfire-logo.png"
            alt="TrashFire"
            width={160}
            height={48}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:text-[#00ffea]">
                  Dashboard
                </Button>
              </Link>
              <Link href="/workspace">
                <Button variant="ghost" className="text-white hover:text-[#00ffea]">
                  Workspace
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-[#00ffea]">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Image
              src="/trashfire-logo.png"
              alt="TrashFire"
              width={400}
              height={120}
              className="h-20 md:h-24 w-auto mx-auto"
              priority
            />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ 
            background: 'linear-gradient(to right, #00ffea, #00d2ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Your AI Anime Studio
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Create stunning anime content with AI-powered tools. Generate characters, backgrounds, voices, and full episodes.
          </p>
          <Button
            onClick={handleStartProject}
            size="lg"
            className={cn(
              "bg-[#00ffea] hover:bg-[#00e6d1]",
              "text-black font-semibold text-lg px-8 py-6",
              "shadow-[0_0_30px_rgba(0,255,234,0.4)]",
              "hover:shadow-[0_0_40px_rgba(0,255,234,0.6)]"
            )}
          >
            Start New Project
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Film, title: 'Episode Creation', desc: 'Full episode generation with scenes' },
            { icon: Users, title: 'Character Studio', desc: 'Design and animate characters' },
            { icon: ImageIcon, title: 'Background Design', desc: 'Create stunning environments' },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className={cn(
                  "p-6 bg-[#0a0f15]/80 backdrop-blur-sm",
                  "border border-white/10",
                  "hover:border-[#00ffea]/50",
                  "hover:shadow-[0_0_20px_rgba(0,255,234,0.2)]",
                  "transition-all duration-300"
                )}>
                  <Icon className="h-8 w-8 mb-4" style={{ color: '#00ffea' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{feature.desc}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Recent Projects */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold" style={{ color: '#ffffff' }}>Recent Projects</h2>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-[#00ffea] hover:text-[#00e6d1]">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                >
                  <Link href={`/workspace?project=${project.id}`}>
                    <Card className={cn(
                      "overflow-hidden cursor-pointer group",
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
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-1" style={{ color: '#ffffff' }}>{project.title}</h3>
                        <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>{project.lastEdited}</p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

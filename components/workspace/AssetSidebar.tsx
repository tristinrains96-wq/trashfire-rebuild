'use client'

import { useState } from 'react'
import { FolderTree, Users, MapPin, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface AssetSidebarProps {
  type?: 'tree' | 'characters' | 'locations' | 'projects'
}

export default function AssetSidebar({ type = 'tree' }: AssetSidebarProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'projects'>('characters')

  const mockAssets = {
    characters: [
      { id: '1', name: 'Character 1' },
      { id: '2', name: 'Character 2' },
      { id: '3', name: 'Character 3' },
    ],
    locations: [
      { id: '1', name: 'Location 1' },
      { id: '2', name: 'Location 2' },
    ],
    projects: [
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' },
    ],
  }

  const currentAssets = mockAssets[activeTab]

  const handleAssetClick = (assetId: string) => {
    router.push(`/edit/${assetId}`)
  }

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <FolderTree className="h-5 w-5 text-[#00ffea]" />
        <h2 className="text-lg font-semibold text-white">Asset Library</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
        <Button
          variant={activeTab === 'characters' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('characters')}
          className={cn(
            'transition-all',
            activeTab === 'characters'
              ? 'bg-[#00ffea] text-black hover:bg-[#00e6d1] shadow-[0_0_12px_rgba(0,255,234,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          )}
        >
          <Users className="h-4 w-4 mr-2" />
          <span>Characters</span>
        </Button>
        <Button
          variant={activeTab === 'locations' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('locations')}
          className={cn(
            'transition-all',
            activeTab === 'locations'
              ? 'bg-[#00ffea] text-black hover:bg-[#00e6d1] shadow-[0_0_12px_rgba(0,255,234,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          )}
        >
          <MapPin className="h-4 w-4 mr-2" />
          <span>Locations</span>
        </Button>
        <Button
          variant={activeTab === 'projects' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('projects')}
          className={cn(
            'transition-all',
            activeTab === 'projects'
              ? 'bg-[#00ffea] text-black hover:bg-[#00e6d1] shadow-[0_0_12px_rgba(0,255,234,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          )}
        >
          <Folder className="h-4 w-4 mr-2" />
          <span>Projects</span>
        </Button>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-3">
          {currentAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => handleAssetClick(asset.id)}
              className={cn(
                'cursor-pointer group relative overflow-hidden rounded-lg p-3',
                'bg-[#0a0f15]/80 backdrop-blur-sm',
                'border border-white/10',
                'hover:border-[#00ffea]/50',
                'hover:shadow-[0_0_20px_rgba(0,255,234,0.2)]',
                'transition-all duration-300'
              )}
            >
              <div className="aspect-square relative bg-gradient-to-br from-[#00ffea]/10 to-transparent flex items-center justify-center rounded mb-2">
                <div className="h-8 w-8 rounded border border-[#00ffea]/30 bg-[#00ffea]/10 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-sm bg-[#00ffea]/40 group-hover:bg-[#00ffea]/60 transition-colors" />
                </div>
              </div>
              <p className="text-xs font-medium text-white truncate text-center">{asset.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

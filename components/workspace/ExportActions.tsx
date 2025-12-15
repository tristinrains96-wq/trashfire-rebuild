/**
 * Export Actions Component
 * Download and share buttons for rendered episodes
 */

'use client'

import { Download, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ExportActionsProps {
  videoUrl: string
  socialClips?: Array<{ videoUrl: string; platform: string; duration: number }>
}

export default function ExportActions({ videoUrl, socialClips = [] }: ExportActionsProps) {
  const handleDownload = () => {
    // Create download link
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = `trashfire-episode-${Date.now()}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TrashFire Episode',
          text: 'Check out my anime episode!',
          url: videoUrl,
        })
      } catch (error) {
        // User cancelled or error
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(videoUrl)
      alert('Video URL copied to clipboard!')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleDownload}
        className="bg-[#00ffea] hover:bg-[#00e6d1] text-black font-semibold"
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>

      <Button
        onClick={handleShare}
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {socialClips.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Shorts ({socialClips.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0a0f15] border-white/10">
            {socialClips.map((clip, index) => (
              <DropdownMenuItem
                key={index}
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = clip.videoUrl
                  link.download = `trashfire-${clip.platform}-${clip.duration}s.mp4`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                {clip.platform} ({clip.duration}s)
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}


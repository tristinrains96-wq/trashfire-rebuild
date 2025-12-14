'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Carousel, CarouselItem } from '@/components/ui/carousel'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Asset {
  id: string
  name: string
  thumbnail: string
  type: 'character' | 'location' | 'project'
  metadata?: {
    created?: string
    modified?: string
    tags?: string[]
  }
}

interface AssetGalleryProps {
  assets: Asset[]
  type: 'characters' | 'locations' | 'projects'
  onAssetClick?: (asset: Asset) => void
  className?: string
}

export default function AssetGallery({
  assets,
  type,
  onAssetClick,
  className,
}: AssetGalleryProps) {
  const router = useRouter()
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset)
    if (onAssetClick) {
      onAssetClick(asset)
    } else {
      router.push(`/edit/${asset.id}`)
    }
  }

  const handleEdit = (asset: Asset) => {
    router.push(`/edit/${asset.id}`)
  }

  if (assets.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 rounded-lg border border-white/10 bg-[#0a0f15]/50", className)}>
        <div className="text-center">
          <p className="text-white/40 text-sm mb-2">No {type} yet</p>
          <p className="text-white/20 text-xs">Create your first {type.slice(0, -1)} to get started</p>
        </div>
      </div>
    )
  }

  // Group assets into rows of 4 for carousel
  const rows: Asset[][] = []
  for (let i = 0; i < assets.length; i += 4) {
    rows.push(assets.slice(i, i + 4))
  }

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <Carousel showArrows={rows.length > 1} showDots={rows.length > 1}>
        {rows.map((row, rowIndex) => (
          <CarouselItem key={rowIndex}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
              {row.map((asset) => (
                <motion.div
                  key={asset.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group relative"
                >
                  <Card
                    className={cn(
                      "overflow-hidden cursor-pointer",
                      "bg-[#0a0f15]/80 backdrop-blur-sm",
                      "border border-white/10",
                      "hover:border-[#00ffea]/50",
                      "hover:shadow-[0_0_20px_rgba(0,255,234,0.2)]",
                      "transition-all duration-300"
                    )}
                    onClick={() => handleAssetClick(asset)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={asset.thumbnail}
                        alt={asset.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(asset)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAssetClick(asset)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-white truncate">{asset.name}</h3>
                      {asset.metadata?.created && (
                        <p className="text-xs text-white/40 mt-1">
                          {new Date(asset.metadata.created).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  )
}


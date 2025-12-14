'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TopBar from '@/components/TopBar'
import { cn } from '@/lib/utils'

export default function EditAssetPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [asset, setAsset] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch asset data
    // TODO: Replace with actual API call
    setAsset({
      id,
      name: 'Sample Asset',
      description: 'Asset description',
      type: 'character',
    })
    setLoading(false)
  }, [id])

  const handleSave = () => {
    // TODO: Save asset
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white/60 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className={cn(
          "bg-[#0a0f15]/95 backdrop-blur-xl",
          "border border-white/10",
          "shadow-[0_0_60px_rgba(0,255,234,0.1)]"
        )}>
          <CardHeader>
            <CardTitle className="text-white">Edit Asset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Name
              </label>
              <Input
                value={asset?.name || ''}
                onChange={(e) => setAsset({ ...asset, name: e.target.value })}
                className={cn(
                  "bg-black/30 border-white/10",
                  "focus:border-[#00ffea] focus:ring-[#00ffea]/20",
                  "text-white"
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description
              </label>
              <Textarea
                value={asset?.description || ''}
                onChange={(e) => setAsset({ ...asset, description: e.target.value })}
                className={cn(
                  "bg-black/30 border-white/10",
                  "focus:border-[#00ffea] focus:ring-[#00ffea]/20",
                  "text-white"
                )}
                rows={6}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex-1 border border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className={cn(
                  "flex-1",
                  "bg-[#00ffea] hover:bg-[#00e6d1]",
                  "text-black font-semibold",
                  "shadow-[0_0_20px_rgba(0,255,234,0.3)]"
                )}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


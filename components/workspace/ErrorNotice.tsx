/**
 * Error Notice Component
 * Clear UI notices for render errors
 */

'use client'

import { AlertCircle, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ErrorNoticeProps {
  error: string
  onDismiss?: () => void
  onRetry?: () => void
}

export default function ErrorNotice({ error, onDismiss, onRetry }: ErrorNoticeProps) {
  return (
    <Card className="bg-red-950/20 border-red-500/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-400 mb-1">
              Render Error
            </h3>
            <p className="text-sm text-white/80">{error}</p>
            {onRetry && (
              <Button
                onClick={onRetry}
                className="mt-3 bg-red-500 hover:bg-red-600 text-white"
                size="sm"
              >
                Retry
              </Button>
            )}
          </div>
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


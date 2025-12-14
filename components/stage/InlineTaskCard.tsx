'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, AlertCircle, Play, Sparkles } from 'lucide-react'

interface InlineTaskChipProps {
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  onAction?: () => void
  className?: string
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20'
  },
  'in-progress': {
    icon: Play,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  }
}

export default function InlineTaskChip({ 
  title, 
  description, 
  status, 
  onAction,
  className = "" 
}: InlineTaskChipProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.bgColor} ${config.borderColor} border ${config.color}`}>
        <Sparkles className="h-3 w-3" />
        <span>{title}</span>
        <Icon className="h-3 w-3" />
      </div>
      
      {onAction && status === 'pending' && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs hover:bg-teal-500/10 hover:text-teal-400"
          onClick={onAction}
        >
          Generate
        </Button>
      )}
      
      {onAction && status === 'pending' && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs hover:bg-blue-500/10 hover:text-blue-400"
          onClick={() => console.log('Assign existing')}
        >
          Assign Existing
        </Button>
      )}
      
      {status === 'pending' && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs hover:bg-gray-500/10 hover:text-gray-400"
          onClick={() => console.log('Skip')}
        >
          Skip
        </Button>
      )}
    </motion.div>
  )
}

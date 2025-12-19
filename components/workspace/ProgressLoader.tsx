'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressLoaderProps {
  progress: number
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressLoader({ 
  progress, 
  label, 
  className,
  size = 'md'
}: ProgressLoaderProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const strokeWidth = {
    sm: 2,
    md: 3,
    lg: 4
  }

  const radius = {
    sm: 18,
    md: 24,
    lg: 36
  }

  const circumference = 2 * Math.PI * radius[size]
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="transform -rotate-90" width={sizeClasses[size]} height={sizeClasses[size]}>
          <circle
            cx={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
            cy={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
            r={radius[size]}
            stroke="currentColor"
            strokeWidth={strokeWidth[size]}
            fill="none"
            className="text-white/10"
          />
          <motion.circle
            cx={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
            cy={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
            r={radius[size]}
            stroke="currentColor"
            strokeWidth={strokeWidth[size]}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-[#00ffea]"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-semibold text-[#00ffea]",
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          )}>
            {progress}%
          </span>
        </div>
      </div>
      {label && (
        <p className="text-xs text-white/60 text-center max-w-[120px]">
          {label}
        </p>
      )}
    </div>
  )
}


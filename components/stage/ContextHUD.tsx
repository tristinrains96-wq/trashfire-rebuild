'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  Target,
  Users,
  CheckCircle,
  Heart,
  ChevronDown
} from 'lucide-react'

interface ContextHUDProps {
  context: string
  className?: string
}

export default function ContextHUD({ context, className = "" }: ContextHUDProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  // Mock data for demonstration
  const data = {
    plan: [
      { id: '1', title: 'Character Design', status: 'completed' },
      { id: '2', title: 'Background Art', status: 'in-progress' },
      { id: '3', title: 'Voice Casting', status: 'pending' }
    ],
    entities: [
      { name: 'Protagonist', type: 'character' },
      { name: 'Forest Scene', type: 'background' },
      { name: 'Narrator Voice', type: 'voice' }
    ],
    tasks: [
      { id: '1', title: 'Generate character', priority: 'high' },
      { id: '2', title: 'Create background', priority: 'medium' },
      { id: '3', title: 'Record voice', priority: 'low' }
    ],
    health: {
      status: 'good',
      score: 85,
      issues: 2
    }
  }

  const pills = [
    { 
      key: 'plan', 
      label: 'Plan', 
      icon: Target, 
      count: data.plan.length,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20'
    },
    { 
      key: 'entities', 
      label: 'Entities', 
      icon: Users, 
      count: data.entities.length,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    { 
      key: 'tasks', 
      label: 'Tasks', 
      icon: CheckCircle, 
      count: data.tasks.length,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    { 
      key: 'health', 
      label: 'Health', 
      icon: Heart, 
      count: data.health.score,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    }
  ]

  const renderPopoverContent = (key: string) => {
    switch (key) {
      case 'plan':
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white mb-2">Plan Progress</h4>
            {data.plan.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'completed' ? 'bg-green-400' :
                  item.status === 'in-progress' ? 'bg-yellow-400' : 'bg-gray-400'
                }`} />
                <span className="text-white/70 truncate">{item.title}</span>
              </div>
            ))}
          </div>
        )
      case 'entities':
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white mb-2">Detected Entities</h4>
            {data.entities.map((entity, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-white/70 truncate">{entity.name}</span>
                <span className="text-white/40 text-xs">({entity.type})</span>
              </div>
            ))}
          </div>
        )
      case 'tasks':
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white mb-2">Active Tasks</h4>
            {data.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  task.priority === 'high' ? 'bg-red-400' :
                  task.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-400'
                }`} />
                <span className="text-white/70 truncate">{task.title}</span>
              </div>
            ))}
          </div>
        )
      case 'health':
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white mb-2">System Health</h4>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/70">Score: {data.health.score}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-white/70">Issues: {data.health.issues}</span>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {pills.map((pill) => {
        const Icon = pill.icon
        const isOpen = openPopover === pill.key
        
        return (
          <div key={pill.key} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenPopover(isOpen ? null : pill.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${pill.bgColor} ${pill.borderColor} border ${pill.color} hover:bg-opacity-20`}
            >
              <Icon className="h-3 w-3" />
              <span>{pill.count}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-64 max-w-[280px] bg-zinc-800/95 backdrop-blur-sm rounded-lg border border-white/10 p-3 shadow-xl z-50"
                >
                  {renderPopoverContent(pill.key)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

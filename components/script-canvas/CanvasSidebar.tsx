'use client'

import { useState } from 'react'
import { useScriptLabStore } from '@/store/scriptLab'
import { Button } from '@/components/ui/button'
import { Info, AlertTriangle, XCircle, CheckCircle, ChevronDown } from 'lucide-react'
import { mockLLM } from '@/lib/mockScriptLLM'

export default function CanvasSidebar() {
  const { alerts, pushUser, pushAssistant, setFromMockResult } = useScriptLabStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getAlertIcon = (level: 'info' | 'warn' | 'block') => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-400" />
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />
      case 'block':
        return <XCircle className="h-4 w-4 text-red-400" />
    }
  }

  const getAlertBorderColor = (level: 'info' | 'warn' | 'block') => {
    switch (level) {
      case 'info':
        return 'border-blue-400/30'
      case 'warn':
        return 'border-amber-400/30'
      case 'block':
        return 'border-red-400/30'
    }
  }

  const handleAlertAction = async (prompt: string) => {
    pushUser(prompt)
    
    try {
      const result = await mockLLM(prompt, useScriptLabStore.getState())
      pushAssistant(result.explainer)
      setFromMockResult(result)
    } catch (error) {
      console.error('Alert action error:', error)
      pushAssistant('Sorry, I encountered an error. Please try again.')
    }
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className={`border-l border-teal-500/20 bg-background/95 backdrop-blur transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Mobile collapse button */}
      <div className="lg:hidden p-2 border-b border-teal-500/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center text-teal-300 hover:bg-teal-600/20"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          {!isCollapsed && <span className="ml-2">Alerts ({alerts.length})</span>}
        </Button>
      </div>
      
      {!isCollapsed && (
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-teal-400" />
            Assistant Alerts
          </h3>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getAlertBorderColor(alert.level)} bg-gray-800/50`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {getAlertIcon(alert.level)}
                  <p className="text-sm text-gray-300 flex-1">{alert.msg}</p>
                </div>
                
                {alert.action && (
                  <Button
                    size="sm"
                    onClick={() => handleAlertAction(alert.action!.prompt)}
                    className="w-full bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-400/30"
                  >
                    {alert.action.label}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

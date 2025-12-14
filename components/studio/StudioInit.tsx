'use client'

import { useEffect, useState } from 'react'
import chatBus from '@/lib/chat-bus'
import { useStudioStore } from '@/store/useStudioStore'
import { detectIntent } from '@/flows/StudioFlowController'

export default function StudioInit() {
  const [isClient, setIsClient] = useState(false)
  const pushMessage = useStudioStore((state) => state.pushMessage)
  const applyIntent = useStudioStore((state) => state.applyIntent)
  const setStylePack = useStudioStore((state) => state.setStylePack)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !pushMessage || !applyIntent || !setStylePack) return

    const unsubscribe = chatBus.on('command:submit', ({ text, files }) => {
      // Push user message
      pushMessage({
        id: Date.now().toString(),
        role: 'user',
        text,
        options: files ? [{ label: `${files.length} file(s) attached`, action: 'files:attached' }] : undefined
      })

      // Detect intent and apply
      const intentResult = detectIntent(text)
      
      // If it's a style change, set it first
      if (intentResult.intent === 'set_style' && intentResult.payload?.stylePack) {
        setStylePack(intentResult.payload.stylePack)
      }
      
      // Apply the intent
      applyIntent(intentResult)
    })

    return unsubscribe
  }, [isClient, pushMessage, applyIntent, setStylePack])

  return null
}

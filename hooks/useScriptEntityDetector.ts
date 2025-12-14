'use client'

import { useCallback, useRef, useEffect } from 'react'

interface EntityDetectionResult {
  characters: string[]
  locations: string[]
  objects: string[]
  actions: string[]
}

export function useScriptEntityDetector() {
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    // Initialize Web Worker
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker('/workers/script-entity-detector.js')
    }

    return () => {
      // Cleanup worker on unmount
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  const detectEntities = useCallback((text: string): Promise<EntityDetectionResult> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        // Fallback to synchronous detection if worker not available
        resolve(detectEntitiesSync(text))
        return
      }

      const handleMessage = (e: MessageEvent) => {
        if (e.data.type === 'entities_detected') {
          workerRef.current?.removeEventListener('message', handleMessage)
          resolve(e.data.entities)
        }
      }

      const handleError = (error: ErrorEvent) => {
        workerRef.current?.removeEventListener('error', handleError)
        reject(error)
      }

      workerRef.current.addEventListener('message', handleMessage)
      workerRef.current.addEventListener('error', handleError)

      workerRef.current.postMessage({
        type: 'detect_entities',
        text: text
      })
    })
  }, [])

  return { detectEntities }
}

// Synchronous fallback for when Web Worker is not available
function detectEntitiesSync(text: string): EntityDetectionResult {
  const entities: EntityDetectionResult = {
    characters: [],
    locations: [],
    objects: [],
    actions: []
  }
  
  // Character detection (names starting with capital letters)
  const characterPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g
  const characterMatches = text.match(characterPattern) || []
  entities.characters = Array.from(new Set(characterMatches))
  
  // Location detection (words like "in the", "at the", etc.)
  const locationPattern = /\b(?:in|at|on|near|by)\s+the\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
  const locationMatches: string[] = []
  let match
  while ((match = locationPattern.exec(text)) !== null) {
    locationMatches.push(match[1])
  }
  entities.locations = Array.from(new Set(locationMatches))
  
  // Action detection (verbs in present tense)
  const actionPattern = /\b(?:walks|runs|jumps|sits|stands|looks|sees|hears|says|shouts|whispers)\b/g
  const actionMatches = text.match(actionPattern) || []
  entities.actions = Array.from(new Set(actionMatches))
  
  // Object detection (common objects)
  const objectPattern = /\b(?:door|window|table|chair|book|phone|car|house|tree|flower)\b/g
  const objectMatches = text.match(objectPattern) || []
  entities.objects = Array.from(new Set(objectMatches))
  
  return entities
}

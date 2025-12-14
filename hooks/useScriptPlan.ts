'use client'

import { useScriptLabStore } from '@/store/scriptLab'

export function useScriptPlan() {
  const { planStatus, plan } = useScriptLabStore()
  
  const nextNeeded = {
    characters: plan.characters.filter(c => c.status !== 'ready').length,
    locations: plan.locations.filter(l => l.status !== 'ready').length
  }
  
  return {
    planStatus,
    plan,
    nextNeeded
  }
}

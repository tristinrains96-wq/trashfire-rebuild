/**
 * Pod Manager for TrashFire
 * Handles Vast.ai (dev) and RunPod (prod) RTX 4090 pod lifecycle
 */

export interface PodStatus {
  id: string
  status: 'running' | 'idle' | 'stopped'
  lastActivity?: string
  provider: 'vast' | 'runpod'
}

/**
 * Spin up Vast.ai spot RTX 4090 pod (dev)
 */
export async function spinVastPod(): Promise<string> {
  const apiKey = process.env.VAST_AI_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    // Stub mode
    console.warn('[Pod Manager] Vast.ai API key not configured, using stub')
    return `vast-pod-stub-${Date.now()}`
  }

  try {
    // Vast.ai API call to create spot instance
    // POST https://console.vast.ai/api/v0/asks/
    const response = await fetch('https://console.vast.ai/api/v0/asks/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: 'trashfire',
        image: 'runpod/pytorch:2.0.1-py3.10-cuda11.8.0-devel',
        env: {},
        disk: 20,
        label: 'TrashFire SVD Render',
        // RTX 4090 specs
        gpu_name: 'RTX_4090',
        num_gpus: 1,
      }),
    })

    if (!response.ok) {
      throw new Error(`Vast.ai API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.id
  } catch (error) {
    console.error('[Pod Manager] Vast.ai spin-up error:', error)
    throw error
  }
}

/**
 * Spin up RunPod RTX 4090 pod (prod)
 */
export async function spinRunPodPod(): Promise<string> {
  const apiKey = process.env.RUNPOD_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    // Stub mode
    console.warn('[Pod Manager] RunPod API key not configured, using stub')
    return `runpod-pod-stub-${Date.now()}`
  }

  try {
    // RunPod API call to create pod
    // POST https://api.runpod.io/graphql
    const response = await fetch('https://api.runpod.io/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation {
            podFindAndDeploy(
              input: {
                cloudType: SECURE_CLOUD
                gpuCount: 1
                volumeInGb: 20
                containerDiskInGb: 20
                minVcpuCount: 2
                minMemoryInGb: 15
                gpuTypeId: "NVIDIA RTX 4090"
                name: "TrashFire SVD Render"
                imageName: "runpod/pytorch:2.0.1-py3.10-cuda11.8.0-devel"
                env: []
              }
            ) {
              id
            }
          }
        `,
      }),
    })

    if (!response.ok) {
      throw new Error(`RunPod API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data.podFindAndDeploy.id
  } catch (error) {
    console.error('[Pod Manager] RunPod spin-up error:', error)
    throw error
  }
}

/**
 * Check pod status
 */
export async function checkPodStatus(
  podId: string,
  provider: 'vast' | 'runpod' = 'runpod'
): Promise<PodStatus> {
  if (provider === 'vast') {
    const apiKey = process.env.VAST_AI_API_KEY
    if (!apiKey || apiKey === 'your_key_here') {
      return {
        id: podId,
        status: 'stopped',
        provider: 'vast',
      }
    }

    // Vast.ai status check
    // GET https://console.vast.ai/api/v0/asks/{id}/
    try {
      const response = await fetch(`https://console.vast.ai/api/v0/asks/${podId}/`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        return { id: podId, status: 'stopped', provider: 'vast' }
      }

      const data = await response.json()
      return {
        id: podId,
        status: data.status === 'running' ? 'running' : 'stopped',
        lastActivity: data.last_activity,
        provider: 'vast',
      }
    } catch (error) {
      console.error('[Pod Manager] Vast.ai status check error:', error)
      return { id: podId, status: 'stopped', provider: 'vast' }
    }
  } else {
    // RunPod status check
    const apiKey = process.env.RUNPOD_API_KEY
    if (!apiKey || apiKey === 'your_key_here') {
      return {
        id: podId,
        status: 'stopped',
        provider: 'runpod',
      }
    }

    try {
      const response = await fetch('https://api.runpod.io/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              pod(input: { id: "${podId}" }) {
                id
                status
                lastActivity
              }
            }
          `,
        }),
      })

      if (!response.ok) {
        return { id: podId, status: 'stopped', provider: 'runpod' }
      }

      const data = await response.json()
      return {
        id: podId,
        status: data.data.pod.status === 'RUNNING' ? 'running' : 'stopped',
        lastActivity: data.data.pod.lastActivity,
        provider: 'runpod',
      }
    } catch (error) {
      console.error('[Pod Manager] RunPod status check error:', error)
      return { id: podId, status: 'stopped', provider: 'runpod' }
    }
  }
}

/**
 * Shutdown pod
 */
export async function shutdownPod(
  podId: string,
  provider: 'vast' | 'runpod' = 'runpod'
): Promise<void> {
  if (provider === 'vast') {
    const apiKey = process.env.VAST_AI_API_KEY
    if (!apiKey || apiKey === 'your_key_here') {
      console.warn('[Pod Manager] Vast.ai API key not configured, skipping shutdown')
      return
    }

    // Vast.ai shutdown
    await fetch(`https://console.vast.ai/api/v0/asks/${podId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
  } else {
    const apiKey = process.env.RUNPOD_API_KEY
    if (!apiKey || apiKey === 'your_key_here') {
      console.warn('[Pod Manager] RunPod API key not configured, skipping shutdown')
      return
    }

    // RunPod shutdown
    await fetch('https://api.runpod.io/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation {
            podTerminate(input: { podId: "${podId}" })
          }
        `,
      }),
    })
  }
}


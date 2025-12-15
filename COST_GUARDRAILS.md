# Cost Guardrails

## Overview

Cost guardrails prevent usage overruns and ensure profitability. Implemented as tier-based limits with automatic enforcement.

---

## Minute Caps

### Basic Tier
- **Episodes per month**: 10
- **Minutes per episode**: 5-15 (user-defined)
- **Total minutes/month**: 100-150 minutes
- **Enforcement**: Block generation if limit exceeded

### Pro Tier
- **Episodes per month**: 50
- **Minutes per episode**: 5-15 (user-defined)
- **Total minutes/month**: 250-750 minutes
- **Enforcement**: Block generation if limit exceeded

### Studio Tier
- **Episodes per month**: Unlimited
- **Minutes per episode**: 5-15 (user-defined)
- **Total minutes/month**: Unlimited
- **Enforcement**: Monitor for cost alerts only

---

## Re-roll Limits

### Per Scene Re-rolls
- **Basic**: 1 re-roll per scene
- **Pro**: 3 re-rolls per scene
- **Studio**: 5 re-rolls per scene

### Enforcement
- Track re-roll count per scene ID
- Block re-roll button if limit reached
- Show message: "Re-roll limit reached. Upgrade to Pro for more re-rolls."

---

## Pod Auto-Shutdown

### RunPod Pod Management
- **Idle timeout**: 5 minutes
- **Action**: Automatic termination via RunPod API
- **Trigger**: No active generation requests for 5+ minutes
- **API Call**: `POST /api/runpod/terminate/{pod_id}`

### Implementation
```typescript
// Pseudo-code
let lastActivity = Date.now()
const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes

setInterval(() => {
  if (Date.now() - lastActivity > IDLE_TIMEOUT) {
    terminatePod(podId)
  }
}, 60000) // Check every minute
```

### Cost Impact
- **Active pod**: ~$0.30-0.50/hour
- **Idle pod (5min)**: ~$0.025-0.042 wasted
- **Auto-shutdown savings**: Prevents idle costs

---

## Cost Tracking

### Per Episode Costs
- **Groq LLM**: ~$0.05-0.15/episode
- **RunPod SVD**: ~$0.50-1.50/episode
- **ElevenLabs TTS**: ~$0.10-0.30/episode
- **Total**: $0.65-1.95/episode

### Monitoring
- Log costs per episode in database
- Alert if cost >$2/episode (threshold)
- Dashboard: Show cost breakdown per user/tier

---

## Enforcement Points

1. **Before Generation**: Check tier limits (episodes/month, minutes/month)
2. **During Generation**: Track re-roll count per scene
3. **After Generation**: Log costs, update usage counters
4. **Idle Detection**: Monitor pod activity, auto-shutdown after 5min

---

## User Experience

### Limit Reached Messages
- **Episode limit**: "You've reached your monthly episode limit. Upgrade to Pro for 50 episodes/month."
- **Re-roll limit**: "Re-roll limit reached (1/1). Upgrade to Pro for 3 re-rolls per scene."
- **Cost alert**: "This episode exceeded $2 cost threshold. Consider using LOW quality preset."

---

## API Endpoints

### Usage Check
```
GET /api/usage/check
Response: { episodesUsed: 5, episodesLimit: 10, canGenerate: true }
```

### Re-roll Check
```
GET /api/scenes/{sceneId}/rerolls
Response: { rerollsUsed: 1, rerollsLimit: 3, canReroll: true }
```

### Pod Status
```
GET /api/runpod/status/{podId}
Response: { status: 'idle', lastActivity: '2024-01-01T12:00:00Z', willShutdown: true }
```

---

## Implementation Notes

- **Database**: Track usage per user/tier in PostgreSQL
- **Cache**: Redis for real-time limit checks
- **Webhooks**: Stripe webhooks for tier upgrades
- **Alerts**: Email/Slack for cost threshold breaches

---

## Future Enhancements

- **Soft limits**: Warn at 80% usage
- **Overage billing**: Charge per episode over limit
- **Usage analytics**: Dashboard for cost trends
- **Predictive shutdown**: ML-based pod activity prediction

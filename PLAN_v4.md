# TrashFire Pivot Plan v4 - Cloud Stack Optimization

## Executive Summary

**Pivot Goal**: Replace local Ollama/ComfyUI stack with cloud services (Groq LLM, RunPod/Vast.ai SVD video, ElevenLabs TTS) to achieve production-ready scalability, cost efficiency, and reliability.

**Timeline**: 3-week sprint to lock direction and validate benchmarks
**Success Criteria**: SVD >90% consistency, <$2/episode cost, <5s LLM response time

---

## Optimized Stack Table

| Service | Provider | Use Case | Cost | Notes |
|---------|----------|----------|------|-------|
| **LLM** | Groq | Script generation, character assist, outline | $0.10/1K tokens | ~$0.05-0.15/episode |
| **Video Gen** | RunPod/Vast.ai (SVD) | Scene animation, character motion | $0.30-0.50/hr GPU | ~$0.50-1.50/episode |
| **TTS** | ElevenLabs | Voice synthesis, character dialogue | $0.18/1K chars | ~$0.10-0.30/episode |
| **Fallback** | Fal.ai (Kling) | SVD backup if consistency <90% | $0.05/sec | Toggle if benchmarks fail |

**Total Target Cost**: $0.65-1.95/episode (vs. $10K/mo local infrastructure)

---

## UX Flow

### Primary Workflow
1. **Chat Input** → Groq LLM processes natural language
2. **Auto-Assets** → SVD generates scenes from script breakdown
3. **Tweak** → User adjusts via workspace panels
4. **Render** → Final episode compilation with ElevenLabs voices

### Context Awareness
- Script Lab: Story structure, outline generation
- Characters: Character DNA, voice matching
- Backgrounds: Environment generation
- Scenes: Storyboard → video generation
- Voices: TTS preview and selection
- Episode: Final export and quality presets

---

## Costs & Profits Table

| Tier | Monthly Cost | Episodes/Mo | Cost/Episode | Revenue | Profit Margin |
|------|--------------|-------------|--------------|---------|---------------|
| **Basic** | $10 | 10 | $0.65-1.95 | $10 | 0-80% |
| **Pro** | $20 | 50 | $0.65-1.95 | $20 | 0-80% |
| **Studio** | $50 | Unlimited | $0.65-1.95 | $50 | 0-80% |

**Target**: 500 active users @ $20 ARPU = $10K/mo revenue
**Infrastructure**: ~$500-1000/mo (Groq + RunPod + ElevenLabs)
**Net Profit**: $9K-9.5K/mo (90-95% margin)

---

## Risks & Fixes

### Risk 1: SVD Consistency <90%
**Fix**: Toggle to Fal.ai Kling API (backup provider)
**Trigger**: Automated benchmark after Week 1

### Risk 2: RunPod GPU Availability
**Fix**: Vast.ai as dev fallback, queue system for production
**Trigger**: Spot instance unavailability >5min

### Risk 3: Cost Overruns
**Fix**: Guardrails (minute caps, re-roll limits, auto-shutdown)
**Trigger**: Usage exceeds tier limits

### Risk 4: API Rate Limits
**Fix**: Request queuing + exponential backoff
**Trigger**: 429 errors from Groq/ElevenLabs

---

## 3-Week Roadmap

### Week 1: Core Integration
**Days 1-2**: Groq LLM wrapper + healthz ping
**Days 3-4**: RunPod SVD API client + test generation
**Days 5-7**: ElevenLabs TTS integration + voice preview

**Deliverables**:
- [ ] Groq chat responses <5s
- [ ] SVD test scene generation
- [ ] ElevenLabs voice synthesis working
- [ ] Cost guardrails implemented

**Benchmarks**:
- Groq: <5s response time ✅
- SVD: >90% consistency (test 10 scenes)
- ElevenLabs: <2s TTS generation

---

### Week 2: Pipeline Integration
**Days 8-10**: Script → Scene breakdown → SVD queue
**Days 11-12**: Character DNA → voice matching → ElevenLabs
**Days 13-14**: Episode compilation + quality presets

**Deliverables**:
- [ ] End-to-end episode generation
- [ ] Quality presets (LOW/HIGH) functional
- [ ] Cost tracking per episode
- [ ] Mobile UI fixes (TopBar/KeyboardTray z-index)

**Benchmarks**:
- Full episode: <10min generation time
- Cost: <$2/episode (HIGH quality)
- Mobile: No overlap at 375px width

---

### Week 3: Production Hardening
**Days 15-17**: Error handling + fallbacks (Fal.ai toggle)
**Days 18-19**: Usage limits + billing integration
**Days 20-21**: Load testing + optimization

**Deliverables**:
- [ ] Fal.ai Kling fallback (if SVD fails)
- [ ] Usage caps enforced (Basic: 10/min, Pro: 50/min)
- [ ] Auto-shutdown for idle RunPod pods (5min)
- [ ] Production deployment ready

**Benchmarks**:
- Uptime: 99.9% target
- Error rate: <1%
- Cost per episode: <$2 (validated)

---

## Implementation Prompts

### Groq Integration
```
Create Groq API wrapper in lib/utils.ts:
- Function: groqChat(prompt: string, context?: string) => Promise<string>
- Use GROQ_API_KEY from .env.local
- Model: mixtral-8x7b-32768 (fast, cost-effective)
- Error handling: retry with exponential backoff
- Healthz ping: groqPing() => Promise<boolean>
```

### RunPod SVD Integration
```
Create RunPod API client:
- Function: runpodGenerateVideo(prompt: string, config: VideoConfig) => Promise<VideoResult>
- Use RUNPOD_API_KEY from .env.local
- Model: Stable Video Diffusion (SVD)
- Auto-shutdown: 5min idle timeout via API
- Queue system: Handle spot instance availability
```

### ElevenLabs Integration
```
Create ElevenLabs TTS wrapper:
- Function: elevenLabsTTS(text: string, voiceId: string) => Promise<AudioBuffer>
- Use ELEVENLABS_API_KEY from .env.local
- Voice matching: Map character DNA to voice IDs
- Cost tracking: Track character count per request
```

### Cost Guardrails
```
Implement usage limits:
- Basic tier: 10 episodes/month, 1 re-roll per scene
- Pro tier: 50 episodes/month, 3 re-rolls per scene
- Studio tier: Unlimited, 5 re-rolls per scene
- Auto-shutdown: RunPod pods idle >5min → terminate
- Minute caps: Track generation time per tier
```

---

## Success Metrics

### Technical
- ✅ Groq response time: <5s
- ✅ SVD consistency: >90%
- ✅ ElevenLabs TTS: <2s generation
- ✅ Cost per episode: <$2 (HIGH quality)
- ✅ Mobile UI: No overlap at 375px

### Business
- ✅ Cost per episode: $0.65-1.95
- ✅ Profit margin: 90-95%
- ✅ Revenue target: $10K/mo @ 500 users
- ✅ Uptime: 99.9%

---

## Rollback Plan

If benchmarks fail (e.g., SVD <90% consistency):
1. **Week 1 Fail**: Toggle to Fal.ai Kling API
2. **Week 2 Fail**: Revert to local ComfyUI (temporary)
3. **Week 3 Fail**: Extend timeline + optimize costs

**Decision Point**: End of Week 1 - validate SVD consistency
**Lock Direction**: If benchmarks pass, commit to cloud stack
**Change Only If**: Critical failures (cost >$5/episode, consistency <80%)

---

## Next Steps (Week 1 Start)

1. **Day 1**: Create PLAN_v4.md, update README.md, stub Groq wrapper
2. **Day 2**: Groq integration + healthz ping test
3. **Day 3**: RunPod SVD API client setup
4. **Day 4**: SVD test generation + consistency check
5. **Day 5**: ElevenLabs TTS integration
6. **Day 6**: Cost guardrails implementation
7. **Day 7**: Week 1 benchmarks + decision point

**Lock Direction**: If SVD >90% consistency + cost <$2/episode → proceed to Week 2
**Pivot**: If benchmarks fail → toggle to Fal.ai Kling or extend timeline

---

## Notes

- **Mobile Bug Fix**: TopBar/KeyboardTray need `position: relative; z-index: 10;` for 375px no overlap
- **Healthz Update**: Include Groq ping stub for service health check
- **Env Vars**: Comment out Ollama/ComfyUI, add Groq/RunPod/ElevenLabs placeholders
- **Cost Tracking**: Implement per-episode cost logging for guardrails
- **Auto-Shutdown**: RunPod API call to terminate idle pods after 5min

**This plan locks direction. Changes only if benchmarks fail. Roll or $10K/mo stays trash.**

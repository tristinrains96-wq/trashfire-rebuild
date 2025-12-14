# TrashFire Production Plan

## Vision

Build a professional, affordable, and profitable AI-powered anime production platform that enables creators to generate 5–15 minute episodes with series continuity through a Grok-style chat interface.

## Production Standards

- **Uptime**: 99.9% availability
- **Response Time**: <5 seconds for chat responses
- **Consistency**: 85% character/scene consistency across episodes
- **Cost per Episode**: $0.50–$2.00
- **Revenue Goal**: $10K/month at $20 ARPU (500 active users)

## Implementation Phases

### Phase 1: UI/UX Foundation ✅

**Status**: In Progress

**Components**:
- Leonardo-style asset galleries for characters/backgrounds
- Pika-style generation buttons with progress indicators
- Runway-style timeline editor for scene sequencing
- Grok-style chat interface with context awareness
- Mobile-responsive tabs for on-the-go editing

**Deliverables**:
- [x] Pro workspace layout with 85% canvas default
- [x] Collapsible side panels
- [x] Mobile tab navigation
- [x] Neon #00ffea glow theme
- [ ] Leonardo gallery integration
- [ ] Pika generation UI
- [ ] Runway timeline component

**Timeline**: 2-3 weeks

---

### Phase 2: Chat Workflow

**Status**: Planned

**Components**:
- Groq LLM integration for script generation
- Context management for series continuity
- Auto-asset generation from chat prompts
- Scene breakdown and storyboard generation
- Character consistency tracking

**Deliverables**:
- [ ] Groq API integration
- [ ] Chat context store (Zustand)
- [ ] Prompt → Asset pipeline
- [ ] Scene auto-generation
- [ ] Character DNA tracking

**Timeline**: 3-4 weeks

**Cost Estimate**: 
- Groq API: ~$0.10 per 1K tokens
- Expected: $0.05–$0.15 per episode script

---

### Phase 3: Generation Pipeline

**Status**: Planned

**Components**:
- SDXL for character/background generation
- Hotshot-XL for animation (24fps/30fps)
- ControlNet for consistency
- RunPod GPU infrastructure
- Quality presets (LOW/HIGH)

**Deliverables**:
- [ ] SDXL integration
- [ ] Hotshot-XL animation pipeline
- [ ] ControlNet consistency layer
- [ ] RunPod API client
- [ ] Quality preset system
- [ ] Render queue management

**Timeline**: 4-6 weeks

**Cost Estimate**:
- LOW (720p/24fps local): ~$0.50/episode
- HIGH (1080p/30fps RunPod): ~$1.50–$2.00/episode
- RunPod GPU: ~$0.30–$0.50/hour (RTX 4090)

---

### Phase 4: Auth & Billing

**Status**: Planned

**Components**:
- Clerk authentication
- Stripe payment integration
- Token-based usage limits
- Subscription tiers
- Usage analytics

**Deliverables**:
- [ ] Clerk auth setup
- [ ] Stripe integration
- [ ] Token system (disabled/mock/live modes)
- [ ] Subscription management
- [ ] Usage dashboard
- [ ] Billing webhooks

**Timeline**: 2-3 weeks

**Pricing Strategy**:
- Free: 1 episode/month (LOW quality)
- Pro ($20/month): 10 episodes/month (HIGH quality)
- Studio ($50/month): Unlimited (HIGH quality + priority)

---

### Phase 5: Deployment & Scaling

**Status**: Planned

**Components**:
- Vercel deployment
- Database (PostgreSQL/Supabase)
- CDN for asset delivery
- Monitoring (Sentry/Vercel Analytics)
- Load balancing

**Deliverables**:
- [ ] Vercel production deployment
- [ ] Database schema and migrations
- [ ] CDN configuration
- [ ] Monitoring setup
- [ ] Load testing and optimization
- [ ] 99.9% uptime SLA

**Timeline**: 2-3 weeks

**Infrastructure Costs**:
- Vercel Pro: $20/month
- Database: $25/month (Supabase Pro)
- CDN: ~$10/month (Cloudflare)
- Monitoring: $26/month (Sentry)
- **Total**: ~$81/month base

---

## Benchmarks

### Cost Per Episode

| Quality | Resolution | FPS | Infrastructure | Cost/Episode |
|---------|-----------|-----|----------------|--------------|
| LOW     | 720p      | 24  | Local          | $0.50        |
| HIGH    | 1080p     | 30  | RunPod GPU     | $1.50–$2.00  |

### Revenue Projections

| Metric | Target | Notes |
|--------|--------|-------|
| ARPU   | $20    | Average revenue per user |
| Users  | 500    | Active monthly users |
| Revenue| $10K   | Monthly recurring revenue |
| Margin | 80%+   | After infrastructure costs |

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9%  | Monthly availability |
| Response Time | <5s | Chat API latency |
| Consistency | 85% | Character/scene matching |
| Render Time | <10min | Per episode (HIGH quality) |

---

## Risk Mitigation

### Technical Risks

1. **GPU Availability**: RunPod spot instances may be unavailable
   - **Mitigation**: Queue system + fallback to local rendering

2. **API Rate Limits**: Groq/Stripe rate limits
   - **Mitigation**: Request queuing + exponential backoff

3. **Cost Overruns**: Generation costs exceed projections
   - **Mitigation**: Usage caps + quality presets + cost monitoring

### Business Risks

1. **Low Adoption**: Users don't convert to paid
   - **Mitigation**: Free tier with limits + compelling Pro features

2. **Competition**: Similar tools launch
   - **Mitigation**: Focus on ease-of-use + series continuity

3. **Quality Issues**: Output doesn't meet expectations
   - **Mitigation**: Quality presets + user feedback loop

---

## Success Metrics

### Phase 1 (UI/UX)
- [ ] 85% canvas layout implemented
- [ ] Mobile tabs functional
- [ ] Neon glow theme applied
- [ ] Panel collapse/expand working

### Phase 2 (Chat)
- [ ] <5s chat response time
- [ ] Context retention across sessions
- [ ] Auto-asset generation working

### Phase 3 (Generation)
- [ ] $0.50–$2.00 cost per episode
- [ ] 85% character consistency
- [ ] Render queue stable

### Phase 4 (Billing)
- [ ] Stripe integration live
- [ ] Token system functional
- [ ] Subscription management working

### Phase 5 (Deploy)
- [ ] 99.9% uptime achieved
- [ ] <5s average response time
- [ ] 500+ active users

---

## Next Steps

1. **Immediate**: Complete Phase 1 UI/UX components
2. **Week 1-2**: Integrate Groq LLM for chat
3. **Week 3-4**: Set up SDXL + Hotshot-XL pipeline
4. **Week 5-6**: Implement Clerk + Stripe
5. **Week 7-8**: Deploy to Vercel + monitoring

---

## Resources

- **Groq API**: https://groq.com
- **RunPod**: https://runpod.io
- **Clerk**: https://clerk.com
- **Stripe**: https://stripe.com
- **Vercel**: https://vercel.com
- **SDXL**: https://stability.ai
- **Hotshot-XL**: https://huggingface.co/hotshotco/Hotshot-XL

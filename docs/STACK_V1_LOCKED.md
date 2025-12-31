# TrashFire v1.0 Locked Stack

**Locked technology stack for TrashFire v1.0 production release. This stack is fixed and should not be changed without explicit approval.**

## Frontend Stack

### Core Framework
- **Next.js 14** - App Router (not Pages Router)
- **TypeScript** - Strict mode enabled
- **React 18** - Latest stable

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library (Radix UI primitives)
- **Framer Motion** - Animation library
- **Dark theme** - Default, no light mode in v1.0

### State Management
- **Zustand** - Lightweight state management
- **No Redux** - Zustand only
- **Local storage** - For persistence where needed

## Authentication

- **Clerk** - Primary authentication provider
  - JWT-based authentication
  - User management
  - Session handling
  - Conditional integration (falls back to demo auth if not configured)

## Database & Storage

- **Supabase** - PostgreSQL database
  - Primary database for all data
  - Real-time subscriptions (if needed)
  - Row-level security (RLS) enabled
- **Supabase Storage** - File storage
  - Video files
  - Audio files
  - Generated assets
  - **Alternative:** Cloudflare R2 (if Supabase Storage insufficient)

## Backend Stack

### API Framework
- **FastAPI** (Python) - REST API server
  - Async/await support
  - Automatic OpenAPI docs
  - Type validation with Pydantic

### Task Queue
- **Celery** - Distributed task queue
- **Redis** - Message broker and result backend
  - Task scheduling
  - Background job processing
  - Render queue management

### Planned Backend Structure
```
backend/
├── main.py              # FastAPI app
├── api/                 # API routes
├── services/            # Business logic
├── tasks/                # Celery tasks
├── models/              # Database models
└── utils/               # Utilities
```

## Generation Philosophy

### Core Principle
**Open/GPU core + capped paid switches**

- **Free tier:** Basic generation with open models
- **Paid tier:** Premium models and features
- **Usage caps:** Per-user and global limits
- **Reservations:** Credit reservation system before generation

## Image Generation

### Series Kit (Character/Location Assets)
- **Leonardo AI** - Primary provider for Series Kit
  - Character design
  - Location backgrounds
  - Consistent style across series

### Bulk Keyframes
- **SDXL** (Stable Diffusion XL) - Base model
- **ControlNet** - Pose/structure control
- **IP-Adapter** - Style consistency
- **RunPod/Vast.ai** - GPU infrastructure (RTX 4090)
  - On-demand pod spinning
  - Cost: ~$0.35-0.39/hr

## Motion Generation

### Core Compositor
- **FFmpeg** - Video compositing engine
  - Frame assembly
  - Transitions
  - Effects
  - Audio sync

### Hero Bursts (Action Sequences)
- **Kling AI** - Default provider
  - High-quality motion
  - Fast generation
  - Included in base tier

- **Hailuo AI** - Upsell option
  - Premium motion quality
  - Advanced effects
  - Paid tier only

## Video Polish

### Frame Interpolation
- **RIFE** (Real-Time Intermediate Flow Estimation)
  - Smooth motion
  - Frame rate upscaling
  - Temporal consistency

### Upscaling
- **Real-ESRGAN** - Image/video upscaling
  - 2x-4x upscaling
  - Quality enhancement
  - Detail preservation

## Audio Generation

### Voice Synthesis
- **Piper TTS** - Baseline (free tier)
  - Open-source TTS
  - Multiple languages
  - Fast generation

- **ElevenLabs** - Premium (paid tier)
  - High-quality voices
  - Emotional range
  - Character consistency
  - Turbo model for speed

### Lip Sync
- **Rhubarb** - Lip sync generation
  - Phoneme-to-viseme mapping
  - Automatic lip sync
  - Character animation

## Music

- **User Uploads** - Primary music source
  - Users upload their own music
  - No licensing issues
  - Full control

- **CC0 Pack** - Free music library
  - Creative Commons Zero
  - No attribution required
  - Pre-bundled selection
  - **No subscription music services** - No bundling of paid music subscriptions

## LLM (Script Generation)

- **Groq** - Llama 3.1 8B
  - Fast inference (<1s latency)
  - 99.9% uptime target
  - Cost: $0.05-0.08/M tokens
  - Script generation
  - Outline creation
  - Entity detection

## Infrastructure

### Deployment
- **Vercel** - Frontend deployment
  - Next.js optimized
  - Edge functions
  - CDN

### Compute
- **RunPod** - Primary GPU provider
  - RTX 4090 pods
  - On-demand scaling
  - Cost-effective

- **Vast.ai** - Alternative GPU provider
  - Backup option
  - Competitive pricing
  - Fallback for RunPod

### Monitoring
- **Health checks** - `/healthz` endpoint
- **Error tracking** - (TBD: Sentry or similar)
- **Analytics** - (TBD: PostHog or similar)

## Billing

- **Stripe** - Payment processing
  - Subscription management
  - Usage-based billing
  - Webhook handlers
  - Credit system

### Billing Modes
- `disabled` - No billing (development)
- `mock` - Mock billing (testing)
- `live` - Production billing

## Development Tools

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

### Testing
- **Jest** - (Planned) Unit tests
- **Playwright** - (Planned) E2E tests

### Secret Management
- **Environment variables** - `.env.local` (git-ignored)
- **Secret scanning** - Automated checks
- **No secrets in code** - Zero tolerance

## Version Lock

**This stack is locked for v1.0. Changes require:**
1. Performance justification
2. Cost analysis
3. Migration plan
4. Team approval

**Exceptions:**
- Bug fixes
- Security updates
- Performance optimizations (same stack)

---

**Last Updated:** v1.0 stack lock document
**Status:** Stack locked, ready for implementation


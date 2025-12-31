# TrashFire - AI Anime Episode Creation Tool

**Profitable worldwide AI anime episode SaaS (5–15 min, series continuity)**

> **Core Vision:** Easiest no-code tool on earth — Grok-style chat as primary input, sliders/drag tweaks only, zero prompt engineering or nodes. One-person anime studio: idea → auto-outline/script/assets → gallery/tree → chat tweaks → render/export.

## 🚨 Security First

**⚠️ This is a PUBLIC repository. NEVER commit secrets.**

- ✅ All `.env*` files are git-ignored
- ✅ Secret scanning scripts included
- ✅ See [SECURITY.md](./SECURITY.md) for guidelines
- ✅ Run `npm run public:scan` before committing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- (Optional) API keys for production features (see `.env.example`)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd "Trashfire Production"

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your keys (or leave as placeholders for demo mode)
# See .env.example for all required variables
```

### Development

```bash
# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

See [docs/REPO_MAP.md](./docs/REPO_MAP.md) for complete directory tree and entrypoints.

**Quick Overview:**
- `app/` - Next.js App Router pages
- `components/` - React components
- `lib/` - Utilities and engines (stubs)
- `store/` - Zustand state management
- `hooks/` - Custom React hooks
- `docs/` - Documentation

## 📚 Documentation

- **[Repository Map](./docs/REPO_MAP.md)** - Full directory structure and key entrypoints
- **[Frontend Overview](./docs/FRONTEND_OVERVIEW.md)** - Frontend architecture and components
- **[Backend Overview](./docs/BACKEND_OVERVIEW.md)** - Backend architecture (planned)
- **[Security Guidelines](./SECURITY.md)** - Security best practices

## 🔧 Environment Variables

See `.env.example` for all required variables. Key variables:

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

### Database (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### AI Generation
- `GROQ_API_KEY` - Groq API key (Llama 3.1 8B)
- `ELEVENLABS_API_KEY` - ElevenLabs API key
- `RUNPOD_API_KEY` - RunPod API key
- `VAST_API_KEY` - Vast.ai API key

### Billing (Stripe)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_BILLING_MODE` - `disabled` | `mock` | `live`

### Guardrails
- `GENERATION_ENABLED` - Enable/disable generation
- `ALLOWLIST_EMAILS` - Comma-separated allowlist
- `MAX_EPISODES_PER_DAY` - Daily episode limit
- `GLOBAL_DAILY_SPEND_CAP_USD` - Global spending cap

**Note:** Leave values as placeholders (`YOUR_KEY_HERE`) for demo mode.

## 🎯 Current Status

### ✅ Implemented
- Full UI/UX for all sections
- Zustand state management
- Clerk auth integration (conditional)
- Demo mode with mock data
- Component library (shadcn/ui)
- Workspace navigation
- Script editor UI
- Character management UI
- Scene builder UI

### 🚧 Stubs / Placeholders
- API routes (none exist yet)
- Video generation (`lib/video_engine.ts`)
- Audio generation (`lib/audio_engine.ts`)
- Render pipeline (`lib/render_engine.ts`)
- Pod management (`lib/pod-manager.ts`)
- Supabase client (`lib/supabase.ts`)
- Groq LLM client (`lib/utils.ts`)
- Stripe webhook handlers (`lib/billing.ts`)

### ❌ Not Yet Implemented
- FastAPI backend server
- Celery task queue
- Database migrations
- Real generation endpoints
- Stripe checkout/portal UI
- Webhook handlers

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Security
npm run public:scan      # Scan for secrets
npm run public:check     # Full public branch check

# Testing
npm run smoke            # Smoke tests
npm run phase2_5:check   # Phase 2.5 checks
```

## 🔒 Security Checks

Before committing, run:

```bash
# Scan for secrets
npm run public:scan

# Should output: ✅ PASS: No secrets found
```

If secrets are found:
1. Remove them immediately
2. Rotate the exposed keys
3. Update `.env.local` with new keys
4. Never commit `.env.local`

See [SECURITY.md](./SECURITY.md) for detailed guidelines.

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Authentication:** Clerk (conditional)

### Backend (Planned)
- **API Framework:** FastAPI (Python)
- **Task Queue:** Celery + Redis
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage

### AI Services
- **LLM:** Groq (Llama 3.1 8B)
- **Video:** SDXL + SVD on RunPod/Vast.ai
- **Audio:** ElevenLabs Turbo

## 📖 Key Entrypoints

### Frontend
- **Root Layout:** `app/layout.tsx`
- **Workspace:** `app/workspace/page.tsx`
- **Auth:** `store/auth.ts`, `components/providers/ClientProviders.tsx`
- **Billing:** `lib/billing.ts`

### Backend (Planned)
- **FastAPI Entry:** `backend/main.py` (to be created)
- **Celery Worker:** `backend/celery_app.py` (to be created)
- **Database:** Supabase (PostgreSQL)

See [docs/REPO_MAP.md](./docs/REPO_MAP.md) for complete entrypoint list.

## 🚦 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000 (planned)
- **Health Check:** http://localhost:3000/healthz

## 🤝 Contributing

1. **Never commit secrets** - Always use `.env.local` (git-ignored)
2. **Run secret scan** - `npm run public:scan` before committing
3. **Follow patterns** - See existing code for patterns
4. **Document changes** - Update relevant docs

## 📄 License

See main repository for license information.

## 🔗 Links

- [Repository Map](./docs/REPO_MAP.md)
- [Frontend Overview](./docs/FRONTEND_OVERVIEW.md)
- [Backend Overview](./docs/BACKEND_OVERVIEW.md)
- [Security Guidelines](./SECURITY.md)

---

**Status:** Frontend complete, backend stubs ready for v1.0 implementation

# TrashFire Repository Map

Complete directory structure and key entrypoints for the TrashFire v1.0 codebase.

## 📁 Full Directory Tree

```
TrashFire Production/
├── app/                          # Next.js App Router (Frontend Routes)
│   ├── layout.tsx               # Root layout with ClientProviders
│   ├── page.tsx                 # Home/landing page
│   ├── globals.css              # Global styles
│   ├── dashboard/               # User dashboard
│   │   └── page.tsx
│   ├── login/                   # Demo login page
│   │   └── page.tsx
│   ├── sign-in/                 # Clerk sign-in (if enabled)
│   │   └── [[...sign-in]]/
│   │       └── page.tsx
│   ├── sign-up/                 # Clerk sign-up (if enabled)
│   │   └── [[...sign-up]]/
│   │       └── page.tsx
│   ├── settings/                # User settings page
│   │   └── page.tsx
│   ├── workspace/               # Main workspace (core app)
│   │   ├── page.tsx             # Workspace shell
│   │   ├── script/              # Script editor section
│   │   │   └── page.tsx
│   │   ├── scenes/              # Scenes builder section
│   │   │   └── page.tsx
│   │   └── [section]/           # Dynamic section routes
│   ├── approval/                 # Episode approval page
│   │   └── [id]/
│   │       └── page.tsx
│   ├── edit/                    # Episode editor
│   │   └── [id]/
│   │       └── page.tsx
│   └── healthz/                 # Health check endpoint
│       └── route.ts
│
├── components/                   # React Components
│   ├── providers/
│   │   └── ClientProviders.tsx  # ClerkProvider wrapper (conditional)
│   ├── layout/                  # Layout components
│   │   ├── WorkspaceShell.tsx
│   │   ├── WorkspaceFrame.tsx
│   │   ├── VerticalSidebar.tsx
│   │   ├── BottomStack.tsx
│   │   └── BackgroundFX.tsx
│   ├── workspace/               # Workspace-specific components
│   │   ├── ProjectLab.tsx       # Project management panel
│   │   ├── InspectorPanel.tsx   # Asset inspector
│   │   ├── GuidedSteps.tsx      # Plan mode wizard
│   │   ├── PreviewModeContent.tsx
│   │   ├── BuildModeContent.tsx
│   │   └── [28 more workspace components]
│   ├── script-canvas/           # Script editor components
│   │   ├── ScriptCanvas.tsx     # Main script canvas
│   │   ├── CanvasHeader.tsx
│   │   ├── CanvasBody.tsx
│   │   ├── CanvasFooter.tsx
│   │   ├── CanvasSidebar.tsx
│   │   ├── OutlineTree.tsx
│   │   ├── SceneCards.tsx
│   │   └── [7 more script components]
│   ├── script/                  # Script lab components
│   │   ├── ScriptLab.tsx
│   │   ├── ScriptHub.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatThread.tsx
│   │   ├── SceneBlock.tsx
│   │   └── EntityMappingModal.tsx
│   ├── panels/                  # Side panels
│   │   ├── EpisodePanel.tsx
│   │   ├── CharactersPanel.tsx
│   │   ├── BackgroundsPanel.tsx
│   │   ├── ScenesPanel.tsx
│   │   ├── VoicesPanel.tsx
│   │   └── MusicPanel.tsx
│   ├── stage/                   # Generation/stage components
│   │   ├── GenBox.tsx           # Generation UI
│   │   ├── ChatStream.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ContextHUD.tsx
│   │   ├── FloatingActionBar.tsx
│   │   └── [3 more stage components]
│   ├── studio/                  # Studio mode components
│   │   ├── StudioCanvas.tsx
│   │   ├── StudioInit.tsx
│   │   └── stages/              # Stage-specific components
│   │       └── [6 stage files]
│   ├── scenes/                  # Scene preview components
│   │   ├── ScenesPreviz.tsx
│   │   └── StoryboardStrip.tsx
│   ├── episode/                 # Episode components
│   │   └── SceneCard.tsx
│   ├── characters/              # Character components
│   │   └── VoiceTab.tsx
│   ├── nav/                     # Navigation components
│   │   └── BottomSwitcher.tsx
│   ├── overlays/                # Modal/overlay components
│   ├── ui/                      # shadcn/ui components (17 files)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── [14 more UI primitives]
│   └── [Top-level components]
│       ├── TopBar.tsx
│       ├── NavRibbon.tsx
│       ├── WorkspaceRibbon.tsx
│       ├── SectionRibbon.tsx
│       ├── BottomDock.tsx
│       ├── KeyboardTray.tsx
│       ├── PreviewBox.tsx
│       ├── ProModeToggle.tsx
│       └── CharacterTimeline.tsx
│
├── lib/                         # Core Libraries & Utilities
│   ├── auth.ts                  # Auth utilities (stub in demo)
│   ├── billing.ts               # Stripe billing integration
│   ├── supabase.ts              # Supabase client (stub in demo)
│   ├── utils.ts                 # General utilities + Groq stub
│   ├── guardrails.ts            # Generation guardrails
│   ├── video_engine.ts          # Video rendering engine
│   ├── audio_engine.ts          # Audio synthesis engine
│   ├── render_engine.ts         # Render pipeline
│   ├── pod-manager.ts           # RunPod/Vast.ai pod management
│   ├── storage.ts               # File storage utilities
│   ├── chat-bus.ts              # Event bus for chat
│   ├── toast.ts                 # Toast notifications
│   ├── demo/                    # Demo mode utilities
│   │   ├── projectLabSeed.ts
│   │   └── projectLabTypes.ts
│   ├── demoAuth.ts              # Demo authentication
│   ├── demoMode.ts              # Demo mode detection
│   ├── mockData.ts              # Mock data for demo
│   ├── mockAssets.ts            # Mock asset data
│   ├── mockScriptLLM.ts         # Mock LLM responses
│   ├── prompts/                 # Prompt templates
│   │   └── episodeTemplates.ts
│   └── schemas/                 # Zod schemas
│       └── [2 schema files]
│
├── store/                       # Zustand State Management
│   ├── auth.ts                  # Authentication state
│   ├── workspace.ts             # Workspace state (sections, project)
│   ├── useStudioStore.ts        # Studio mode state
│   ├── scriptLab.ts             # Script lab state
│   └── sceneStore.ts            # Scene state
│
├── hooks/                       # Custom React Hooks
│   ├── useGenBox.ts             # Generation box hook
│   ├── useScriptAI.ts           # Script AI interactions
│   ├── useScriptEntityDetector.ts
│   └── useScriptPlan.ts         # Plan generation hook
│
├── flows/                       # Flow Controllers
│   └── StudioFlowController.ts  # Studio mode flow logic
│
├── types/                       # TypeScript Types
│   └── index.ts
│
├── styles/                      # Styling
│   ├── motion.ts                # Framer Motion variants
│   └── style-packs.ts           # Style pack definitions
│
├── public/                      # Static Assets
│   ├── trashfire-logo.png
│   ├── trashfire-logo.svg
│   ├── logo.jpg
│   ├── mock/                    # Mock assets
│   └── workers/                 # Web workers
│       └── [worker files]
│
├── scripts/                     # Utility Scripts
│   ├── scan_secrets.ts          # Secret scanner
│   ├── public_secret_scan.ts    # Public branch scanner
│   ├── public_check.ts          # Public branch checker
│   ├── phase1_acceptance_test.ts
│   ├── phase2_5_test.ts
│   ├── phase2_test.ts
│   ├── stress_test_week3.ts
│   ├── run_phase2_5_check.ts
│   ├── smoke.mjs
│   ├── open.js
│   ├── install_ffmpeg_windows.ps1
│   └── [more scripts]
│
├── tools/                       # External Tools (git-ignored)
│   └── ffmpeg/                  # FFmpeg binaries
│
├── middleware.ts                # Next.js middleware (auth routing)
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
├── .gitignore                   # Git ignore rules
├── vercel.json                  # Vercel deployment config
│
├── docs/                        # Documentation (NEW)
│   ├── REPO_MAP.md              # This file
│   ├── FRONTEND_OVERVIEW.md     # Frontend architecture
│   └── BACKEND_OVERVIEW.md      # Backend architecture
│
├── SECURITY.md                  # Security guidelines
├── README.md                    # Main README
├── README_PUBLIC.md             # Public branch README
├── SECURITY_PUBLIC.md           # Public branch security
├── UI_ARCHITECTURE_DOCUMENTATION.md
└── UI_UX_NOTES.md
```

## 🎯 Key Entrypoints

### Frontend Entry Points

1. **Root Layout** (`app/layout.tsx`)
   - Wraps entire app with `ClientProviders`
   - Sets up dark theme
   - Global CSS imports

2. **Client Providers** (`components/providers/ClientProviders.tsx`)
   - Conditionally wraps with `ClerkProvider` if Clerk keys configured
   - Falls back to demo mode if no Clerk

3. **Home Page** (`app/page.tsx`)
   - Landing page with project cards
   - Redirects to dashboard if authenticated

4. **Workspace** (`app/workspace/page.tsx`)
   - Main application shell
   - Contains: ProjectLab, InspectorPanel, StudioCanvas
   - Routes to section-specific pages

5. **Dashboard** (`app/dashboard/page.tsx`)
   - User dashboard with recent projects

### Authentication Entry Points

1. **Clerk Integration** (`components/providers/ClientProviders.tsx`)
   - Checks `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Dynamically imports ClerkProvider

2. **Auth Store** (`store/auth.ts`)
   - Zustand store for auth state
   - Syncs with Clerk if enabled
   - Falls back to demo auth

3. **Auth Utilities** (`lib/auth.ts`)
   - `getAuthUser()` - Get current user
   - `requireAuth()` - Protect routes
   - `checkAllowlist()` - Email allowlist

4. **Middleware** (`middleware.ts`)
   - Currently allows all routes (demo mode)
   - Will add auth protection when Clerk enabled

### Billing Entry Points

1. **Billing Config** (`lib/billing.ts`)
   - `initBilling()` - Initialize billing
   - `checkTokenForQuality()` - Check user tokens
   - `checkCredits()` - Check subscription credits
   - `handleStripeWebhook()` - Webhook handler (stub)

2. **Stripe Integration** (Planned)
   - Checkout: `/api/billing/checkout` (not yet implemented)
   - Portal: `/api/billing/portal` (not yet implemented)
   - Webhook: `/api/billing/webhook` (not yet implemented)

### API Client Layer (Current State)

**Currently:** No API routes exist (demo branch)

**Planned Structure:**
```
app/api/
├── episodes/              # Episode CRUD
│   ├── route.ts          # GET, POST
│   └── [id]/
│       └── route.ts      # GET, PATCH, DELETE
├── script/                # Script generation
│   ├── generate/route.ts
│   └── analyze/route.ts
├── characters/            # Character management
├── scenes/                # Scene generation
├── render/                # Video rendering
│   └── route.ts
├── guardrails/            # Guardrails check
│   └── check/route.ts
└── billing/               # Stripe integration
    ├── checkout/route.ts
    ├── portal/route.ts
    └── webhook/route.ts
```

### State Management Entry Points

1. **Auth Store** (`store/auth.ts`)
   - User state, authentication status
   - `useAuth()` hook

2. **Workspace Store** (`store/workspace.ts`)
   - Active section, project metadata
   - Script, characters, scenes data
   - `useWorkspace()` hook

3. **Studio Store** (`store/useStudioStore.ts`)
   - Studio mode state
   - Chat messages, tasks
   - `useStudioStore()` hook

4. **Script Lab Store** (`store/scriptLab.ts`)
   - Script lab state
   - Outline, beats, scene cards
   - `useScriptLab()` hook

### Generation Engine Entry Points (Stubs)

1. **Video Engine** (`lib/video_engine.ts`)
   - `generateVideo()` - Stub
   - Will call RunPod/Vast.ai SVD

2. **Audio Engine** (`lib/audio_engine.ts`)
   - `generateAudio()` - Stub
   - Will call ElevenLabs

3. **Render Engine** (`lib/render_engine.ts`)
   - `renderEpisode()` - Stub
   - Orchestrates video + audio

4. **Pod Manager** (`lib/pod-manager.ts`)
   - `spinRunPodPod()` - Stub
   - `spinVastPod()` - Stub
   - `checkPodStatus()` - Stub

## 🔍 Where to Look For...

### UI Shell / Layout
- `app/layout.tsx` - Root layout
- `components/layout/WorkspaceShell.tsx` - Workspace shell
- `components/layout/WorkspaceFrame.tsx` - Workspace frame
- `components/TopBar.tsx` - Top navigation bar

### Episode Wizard UI
- `app/workspace/page.tsx` - Workspace entry
- `components/workspace/GuidedSteps.tsx` - Plan mode wizard
- `components/workspace/ProjectLab.tsx` - Project management

### Character Studio UI
- `components/panels/CharactersPanel.tsx` - Character panel
- `components/CharacterDNASidebar.tsx` - Character DNA editor
- `components/characters/VoiceTab.tsx` - Voice assignment

### Settings / Billing Pages
- `app/settings/page.tsx` - Settings page
- `lib/billing.ts` - Billing logic (stub)
- Billing UI components (to be implemented)

### Script Editor
- `app/workspace/script/page.tsx` - Script page
- `components/script-canvas/ScriptCanvas.tsx` - Main canvas
- `components/script/ScriptLab.tsx` - Script lab
- `components/script/ChatInput.tsx` - AI chat input

### Scene Builder
- `app/workspace/scenes/page.tsx` - Scenes page
- `components/panels/ScenesPanel.tsx` - Scenes panel
- `components/scenes/ScenesPreviz.tsx` - Scene preview

## 📊 Current Implementation Status

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

## 🚀 Next Steps for v1.0 Implementation

1. **Backend Setup**
   - Create FastAPI server structure
   - Set up Celery workers
   - Database schema and migrations

2. **API Routes**
   - Implement Next.js API routes
   - Connect to FastAPI backend
   - Add authentication middleware

3. **Generation Stack**
   - Integrate Groq LLM
   - Set up RunPod/Vast.ai pods
   - Integrate ElevenLabs
   - Build render pipeline

4. **Billing**
   - Stripe checkout flow
   - Subscription management
   - Webhook handlers
   - Credit tracking

---

**Last Updated:** Repository map for TrashFire v1.0 prep
**Status:** Frontend complete, backend stubs ready for implementation


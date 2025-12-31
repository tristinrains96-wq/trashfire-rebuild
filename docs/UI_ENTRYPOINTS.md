# TrashFire UI Entrypoints

Complete guide to Next.js entrypoints, component locations, and state management.

## Next.js Entrypoints

### Root Layout (`app/layout.tsx`)
**Purpose:** Root layout that wraps the entire application
- Sets up dark theme (`className="dark"`)
- Imports global CSS (`globals.css`)
- Wraps app with `ClientProviders` (ClerkProvider wrapper)
- Uses Inter font from Google Fonts

**Key Features:**
- Server component (no 'use client')
- Provides `ClientProviders` for conditional Clerk integration
- Sets HTML lang="en" and suppresses hydration warnings

### Home Page (`app/page.tsx`)
**Route:** `/`
**Purpose:** Landing page with project showcase
- Shows features grid (Episode Creation, Character Studio, Background Design)
- Displays recent projects if authenticated
- "Get Started" button → redirects to `/dashboard` or `/login`
- Uses `useAuth()` hook to check authentication status

### Main Workspace (`app/workspace/page.tsx`)
**Route:** `/workspace`
**Purpose:** Core application workspace shell
- Main entry point for episode creation workflow
- Contains three modes: Plan, Build, Preview
- Layout structure:
  - `TopBar` (fixed sticky header)
  - `BackgroundFX` (animated background)
  - `ProWorkspaceLayout`:
    - Left Panel: `ProjectLab` (project management)
    - Right Panel: `InspectorPanel` (asset inspector)
    - Center: Mode-specific content (`PlanModeContent`, `BuildModeContent`, `PreviewModeContent`)
  - `BottomStack`: `SectionRibbon` (desktop only)
- Uses `useWorkspace()` hook for state management
- Manages `ProjectLabState` for project/episode data

### Workspace Sections

**Script Editor** (`app/workspace/script/page.tsx`)
**Route:** `/workspace/script`
- Script editing interface
- Uses `ScriptCanvas` component
- Integrates with `useScriptLab()` store

**Scene Builder** (`app/workspace/scenes/page.tsx`)
**Route:** `/workspace/scenes`
- Scene composition interface
- Uses scene-related components from `components/scenes/`

### Other Routes

**Dashboard** (`app/dashboard/page.tsx`)
**Route:** `/dashboard`
- User dashboard with recent projects
- Project grid view

**Settings** (`app/settings/page.tsx`)
**Route:** `/settings`
- User settings page
- Account management
- Billing settings (to be implemented)

**Login** (`app/login/page.tsx`)
**Route:** `/login`
- Demo login page (fallback when Clerk disabled)
- Simple email/password form

**Clerk Auth Routes:**
- `app/sign-in/[[...sign-in]]/page.tsx` - Clerk sign-in (if Clerk enabled)
- `app/sign-up/[[...sign-up]]/page.tsx` - Clerk sign-up (if Clerk enabled)

**Episode Routes:**
- `app/approval/[id]/page.tsx` - Episode approval page
- `app/edit/[id]/page.tsx` - Episode editor

**Health Check** (`app/healthz/route.ts`)
**Route:** `/healthz`
- API route for health checks
- Returns JSON status

## Component Locations

### Sidebar / Topbar / Navigation

**Top Bar** (`components/TopBar.tsx`)
- Fixed sticky header at top of page
- Logo link to home (`/`)
- Navigation buttons (Dashboard, Workspace)
- `ProModeToggle` component
- User dropdown menu (Settings, Sign Out)
- Uses `useAuth()` hook

**Vertical Sidebar** (`components/layout/VerticalSidebar.tsx`)
- Vertical sidebar component
- Section navigation

**Bottom Navigation** (`components/nav/BottomSwitcher.tsx`)
- Bottom navigation switcher
- Mobile-friendly navigation

**Section Ribbon** (`components/workspace/SectionRibbon.tsx`)
- Section navigation ribbon
- Used in workspace for section switching

**Workspace Ribbon** (`components/WorkspaceRibbon.tsx`)
- Workspace-specific ribbon navigation

### Live Preview / Timeline

**Preview Box** (`components/PreviewBox.tsx`)
- Live preview component
- Displays preview of current work

**Preview Mode Content** (`components/workspace/PreviewModeContent.tsx`)
- Preview mode UI
- Shows rendered preview of episode

**Character Timeline** (`components/CharacterTimeline.tsx`)
- Character timeline component
- Shows character progression

**Storyboard Strip** (`components/scenes/StoryboardStrip.tsx`)
- Storyboard visualization
- Timeline view of scenes

**Scenes Preview** (`components/scenes/ScenesPreviz.tsx`)
- Scene preview component
- Visual preview of scenes

### Workspace Core Components

**Workspace Shell** (`components/layout/WorkspaceShell.tsx`)
- Main workspace container
- Handles layout structure
- Responsive breakpoints

**Workspace Frame** (`components/layout/WorkspaceFrame.tsx`)
- Workspace content frame
- Contains panels and canvas

**Project Lab** (`components/workspace/ProjectLab.tsx`)
- Project management panel (left side)
- Episode creation and selection
- Project metadata

**Inspector Panel** (`components/workspace/InspectorPanel.tsx`)
- Asset inspector panel (right side)
- Property editing
- Lock management

**Pro Workspace Layout** (`components/workspace/ProWorkspaceLayout.tsx`)
- Main workspace layout component
- Three-panel layout (left, center, right)
- Mode switching

**Mode Switcher** (`components/workspace/ModeSwitcher.tsx`)
- Three mode buttons: Plan, Build, Preview
- Active mode highlighting
- Saves to localStorage

**Guided Steps** (`components/workspace/GuidedSteps.tsx`)
- Plan mode wizard
- Step-by-step guidance
- Only visible in Plan mode

## State Management

### Zustand Stores Location

**Auth Store** (`store/auth.ts`)
- **Hook:** `useAuth()`
- **State:**
  - `user: User | null`
  - `isAuthenticated: boolean`
- **Actions:**
  - `login(email, password)`
  - `logout()`
  - `setUser(user)`
  - `syncWithClerk()`
- **Usage:** Used in `TopBar`, `app/page.tsx`, and throughout app for auth checks

**Workspace Store** (`store/workspace.ts`)
- **Hook:** `useWorkspace()`
- **State:**
  - `activeSection: Section` ('script' | 'characters' | 'backgrounds' | 'voices' | 'scenes' | 'episode')
  - `project: ProjectMeta` (title, episodeId, episodeNumber)
  - `currentScript: SceneBlock[]`
  - `characters: Character[]`
  - `episodeScaffold: EpisodeScaffold | null`
  - `status: Status`
  - `taskProgress: number | null`
- **Actions:**
  - `setSection(section)`
  - `setProject(project)`
  - `setCurrentScript(script)`
  - `updateSceneBlock(sceneId, updates)`
  - `setCharacters(characters)`
  - `updateCharacter(characterId, updates)`
- **Usage:** Used in workspace pages and components for workspace state

**Script Lab Store** (`store/scriptLab.ts`)
- **Hook:** `useScriptLab()`
- **State:**
  - `chat: ChatMessage[]` - AI chat history
  - `outline: OutlineModel | null`
  - `beats: BeatModel[]`
  - `sceneCards: SceneCardModel[]`
  - `plan: Plan`
  - `draft: string | null`
  - `canonicalScript: string | null`
- **Actions:**
  - `pushUser(text)`
  - `pushAssistant(text)`
  - `setFromMockResult(result)`
  - `generatePlanFromDraft()`
  - `approvePlan()`
- **Usage:** Used in script editor and script lab components

**Studio Store** (`store/useStudioStore.ts`)
- **Hook:** `useStudioStore()`
- **State:**
  - `messages: Message[]`
  - `tasks: Task[]`
  - `activePanel: ActivePanel`
  - `stylePack: StylePack | undefined`
  - `workspaceSessionId: string`
- **Actions:**
  - `setActive(panel)`
  - `pushMessage(message)`
  - `pushAI(text, options)`
  - `addTask(task)`
  - `updateTask(id, updates)`
- **Usage:** Used in studio mode components

**Scene Store** (`store/sceneStore.ts`)
- **Hook:** `useSceneStore()` (if exported)
- **State:** Scene-specific state
- **Usage:** Used in scene-related components

## Middleware / Auth / Billing

### Middleware (`middleware.ts`)
- **Purpose:** Next.js middleware for route protection
- **Current State:** Allows all routes (demo mode)
- **Future:** Will add Clerk auth protection when enabled
- **Config:** Matches all routes except static files and Next.js internals

### Auth Integration

**Client Providers** (`components/providers/ClientProviders.tsx`)
- Conditionally wraps app with `ClerkProvider` if Clerk enabled
- Checks `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Falls back to plain children if Clerk not configured
- Dynamically imports Clerk to avoid SSR issues

**Auth Utilities** (`lib/auth.ts`)
- `getAuthUser(request)` - Get authenticated user
- `requireAuth(request)` - Protect routes (throws if not authenticated)
- `checkAllowlist(email)` - Check email allowlist
- `checkRateLimit(userId, maxRequests, windowMs)` - Rate limiting

**Demo Auth** (`lib/demoAuth.ts`)
- `getDemoUser()` - Returns demo user
- `isAuthenticated()` - Checks demo auth status
- Used when Clerk not configured

### Billing Integration

**Billing Config** (`lib/billing.ts`)
- `initBilling(customConfig)` - Initialize billing system
- `checkTokenForQuality(userId, qualityPreset)` - Check user tokens
- `checkCredits(userId, estimatedMinutes)` - Check subscription credits
- `handleStripeWebhook(event, signature)` - Webhook handler (stub)
- `getUserTier(userId)` - Get user subscription tier
- **Modes:** `disabled` | `mock` | `live` (via `NEXT_PUBLIC_BILLING_MODE`)

**Stripe Integration** (Planned)
- Checkout: `/api/billing/checkout` (not yet implemented)
- Portal: `/api/billing/portal` (not yet implemented)
- Webhook: `/api/billing/webhook` (not yet implemented)

## Component Hierarchy

### Root Layout Hierarchy
```
RootLayout (app/layout.tsx)
└── ClientProviders (components/providers/ClientProviders.tsx)
    └── [Page Component]
        ├── TopBar (if authenticated)
        ├── BackgroundFX
        └── [Page Content]
```

### Workspace Page Hierarchy
```
WorkspacePage (app/workspace/page.tsx)
└── WorkspaceContent
    ├── StudioInit
    ├── TopBar
    ├── BackgroundFX
    └── ProWorkspaceLayout
        ├── Left Panel: ProjectLab
        │   └── SlotEditModal (conditional)
        ├── Right Panel: InspectorPanel
        └── Center Content
            ├── ModeSwitcher
            ├── GuidedSteps (Plan mode only)
            ├── PlanModeContent (if mode='plan')
            ├── BuildModeContent (if mode='build')
            └── PreviewModeContent (if mode='preview')
    └── BottomStack
        └── SectionRibbon
```

### Script Canvas Hierarchy
```
ScriptCanvas (components/script-canvas/ScriptCanvas.tsx)
├── CanvasHeader
├── CanvasBody
│   ├── OutlineTree
│   └── SceneCards
├── CanvasSidebar
├── CanvasTopBar
└── CanvasFooter
```

---

**Last Updated:** UI entrypoints guide for TrashFire v1.0
**Status:** Complete frontend structure documented


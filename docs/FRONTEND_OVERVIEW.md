# TrashFire Frontend Overview

Complete guide to the TrashFire frontend architecture, components, and patterns.

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Authentication:** Clerk (conditional) + Demo fallback
- **Billing:** Stripe (stub)

### Project Structure

```
app/                    # Next.js App Router pages
components/             # React components
lib/                    # Utilities and engines
store/                  # Zustand stores
hooks/                  # Custom React hooks
styles/                 # Global styles and themes
public/                 # Static assets
```

## 📱 App Routes

### Public Routes

- `/` - Home/landing page
- `/login` - Demo login (fallback when Clerk disabled)
- `/sign-in` - Clerk sign-in (if Clerk enabled)
- `/sign-up` - Clerk sign-up (if Clerk enabled)

### Protected Routes

- `/dashboard` - User dashboard with recent projects
- `/workspace` - Main workspace (core app)
- `/workspace/script` - Script editor section
- `/workspace/scenes` - Scene builder section
- `/workspace/[section]` - Dynamic section routes
- `/settings` - User settings
- `/approval/[id]` - Episode approval page
- `/edit/[id]` - Episode editor

### API Routes (Planned)

Currently no API routes exist. Planned structure:
- `/api/episodes/*` - Episode CRUD
- `/api/script/*` - Script generation
- `/api/render/*` - Video rendering
- `/api/billing/*` - Stripe integration

## 🧩 Component Library

### UI Primitives (`components/ui/`)

Based on shadcn/ui (Radix UI):
- `button.tsx` - Button component
- `card.tsx` - Card container
- `input.tsx` - Text input
- `select.tsx` - Dropdown select
- `slider.tsx` - Range slider
- `tabs.tsx` - Tab navigation
- `tooltip.tsx` - Tooltip
- `progress.tsx` - Progress bar
- `switch.tsx` - Toggle switch
- `label.tsx` - Form label
- `separator.tsx` - Divider
- `dropdown-menu.tsx` - Dropdown menu
- `progress.tsx` - Progress indicator
- Plus 4 more primitives

### Layout Components

**Root Layout** (`app/layout.tsx`)
- Wraps entire app
- Sets dark theme
- Imports global CSS
- Provides `ClientProviders`

**Client Providers** (`components/providers/ClientProviders.tsx`)
- Conditionally wraps with `ClerkProvider` if Clerk enabled
- Falls back to plain children if Clerk not configured
- Checks `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Workspace Shell** (`components/layout/WorkspaceShell.tsx`)
- Main workspace container
- Handles layout structure
- Manages responsive breakpoints

**Workspace Frame** (`components/layout/WorkspaceFrame.tsx`)
- Workspace content frame
- Contains panels and canvas

**Top Bar** (`components/TopBar.tsx`)
- Top navigation bar
- User menu
- Project switcher

**Background FX** (`components/layout/BackgroundFX.tsx`)
- Animated background effects
- Particle systems

### Workspace Components

**Project Lab** (`components/workspace/ProjectLab.tsx`)
- Project management panel
- Episode creation
- Project selection

**Inspector Panel** (`components/workspace/InspectorPanel.tsx`)
- Asset inspector
- Property editing
- Lock management

**Guided Steps** (`components/workspace/GuidedSteps.tsx`)
- Plan mode wizard
- Step-by-step guidance
- Progress tracking

**Mode Content Components:**
- `PreviewModeContent.tsx` - Preview mode UI
- `BuildModeContent.tsx` - Build mode UI
- Plan mode uses `GuidedSteps`

### Script Components

**Script Canvas** (`components/script-canvas/ScriptCanvas.tsx`)
- Main script editor canvas
- Scene block rendering
- Outline tree view

**Script Lab** (`components/script/ScriptLab.tsx`)
- AI-powered script lab
- Chat interface
- Outline generation

**Script Hub** (`components/script/ScriptHub.tsx`)
- Script management hub
- Script library

**Chat Components:**
- `ChatInput.tsx` - Chat input field
- `ChatThread.tsx` - Chat message thread
- `ChatMessage.tsx` - Individual message

**Scene Block** (`components/script/SceneBlock.tsx`)
- Individual scene block
- Scene editing

**Entity Mapping** (`components/script/EntityMappingModal.tsx`)
- Character/location mapping modal
- Entity detection

### Panel Components

- `EpisodePanel.tsx` - Episode metadata panel
- `CharactersPanel.tsx` - Character management panel
- `BackgroundsPanel.tsx` - Background library panel
- `ScenesPanel.tsx` - Scene list panel
- `VoicesPanel.tsx` - Voice assignment panel
- `MusicPanel.tsx` - Music selection panel

### Stage/Generation Components

**Gen Box** (`components/stage/GenBox.tsx`)
- Generation UI container
- Progress display
- Status indicators

**Chat Stream** (`components/stage/ChatStream.tsx`)
- Streaming chat interface
- Real-time updates

**Floating Action Bar** (`components/stage/FloatingActionBar.tsx`)
- Floating action buttons
- Quick actions

**Context HUD** (`components/stage/ContextHUD.tsx`)
- Context information overlay
- Helpful hints

**Task Components:**
- `InlineTaskCard.tsx` - Task card
- `InlineTaskChip.tsx` - Task chip

### Studio Components

**Studio Canvas** (`components/studio/StudioCanvas.tsx`)
- Studio mode canvas
- Asset placement

**Studio Init** (`components/studio/StudioInit.tsx`)
- Studio initialization
- Setup flow

**Stage Components** (`components/studio/stages/`)
- 6 stage-specific components
- Stage transitions

## 🗂️ State Management

### Zustand Stores

**Auth Store** (`store/auth.ts`)
```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  syncWithClerk: () => void
}
```
- Manages authentication state
- Syncs with Clerk if enabled
- Falls back to demo auth

**Workspace Store** (`store/workspace.ts`)
```typescript
interface WorkspaceState {
  activeSection: Section
  project: ProjectMeta
  currentScript: SceneBlock[]
  characters: Character[]
  episodeScaffold: EpisodeScaffold | null
  // ... more state
}
```
- Manages workspace state
- Section navigation
- Project metadata
- Script, characters, scenes data

**Studio Store** (`store/useStudioStore.ts`)
```typescript
interface StudioStore {
  messages: Message[]
  tasks: Task[]
  activePanel: ActivePanel
  stylePack: StylePack | undefined
  // ... more state
}
```
- Studio mode state
- Chat messages
- Task tracking
- UI preferences

**Script Lab Store** (`store/scriptLab.ts`)
```typescript
interface ScriptLabState {
  chat: ChatMessage[]
  outline: OutlineModel | null
  beats: BeatModel[]
  sceneCards: SceneCardModel[]
  plan: Plan
  // ... more state
}
```
- Script lab state
- AI chat history
- Outline and beats
- Plan system

**Scene Store** (`store/sceneStore.ts`)
- Scene-specific state
- Scene editing

### Usage Pattern

```typescript
import { useWorkspace } from '@/store/workspace'
import { useAuth } from '@/store/auth'

function MyComponent() {
  const { activeSection, setSection } = useWorkspace()
  const { isAuthenticated } = useAuth()
  
  // Use state and actions
}
```

## 🎨 Styling & Theme

### Tailwind CSS

- **Config:** `tailwind.config.ts`
- **Global Styles:** `app/globals.css`
- **Theme:** Dark mode by default
- **Custom Colors:** Defined in Tailwind config

### Framer Motion

- **Variants:** `styles/motion.ts`
- **Animations:** Used throughout for transitions
- **Pattern:** Define variants, apply to components

### Style Packs

- **Definition:** `styles/style-packs.ts`
- **Usage:** Applied to projects/episodes
- **Types:** Anime styles, visual themes

## 🔐 Authentication Flow

### Clerk Integration (Conditional)

1. **Check Configuration**
   - `ClientProviders.tsx` checks `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - If present and not placeholder → enable Clerk

2. **Provider Setup**
   - Wraps app with `ClerkProvider`
   - Configures sign-in/sign-up URLs

3. **Auth Sync**
   - `store/auth.ts` syncs with Clerk user
   - `useClerkAuthSync()` hook maintains sync

4. **Protected Routes**
   - `middleware.ts` (currently allows all in demo)
   - Will add auth checks when Clerk enabled

### Demo Auth (Fallback)

- Used when Clerk not configured
- `lib/demoAuth.ts` provides demo user
- `store/auth.ts` uses demo auth
- No real authentication

## 💳 Billing Flow (Stub)

### Billing Config (`lib/billing.ts`)

- **Modes:** `disabled` | `mock` | `live`
- **Config:** `NEXT_PUBLIC_BILLING_MODE`
- **Functions:**
  - `checkTokenForQuality()` - Check user tokens
  - `checkCredits()` - Check subscription credits
  - `handleStripeWebhook()` - Webhook handler (stub)

### Planned UI

- Settings page billing section
- Stripe checkout integration
- Subscription management portal
- Credit display

## 🛠️ Custom Hooks

### `useGenBox` (`hooks/useGenBox.ts`)
- Generation box state
- Progress tracking

### `useScriptAI` (`hooks/useScriptAI.ts`)
- Script AI interactions
- LLM calls

### `useScriptEntityDetector` (`hooks/useScriptEntityDetector.ts`)
- Entity detection
- Character/location mapping

### `useScriptPlan` (`hooks/useScriptPlan.ts`)
- Plan generation
- Plan management

## 📡 API Client Layer (Planned)

### Current State
- No API routes exist
- All data from mock (`lib/mockData.ts`)
- No backend calls

### Planned Structure

```typescript
// lib/api/client.ts (to be created)
export const api = {
  episodes: {
    list: () => fetch('/api/episodes'),
    create: (data) => fetch('/api/episodes', { method: 'POST', body: data }),
    // ...
  },
  script: {
    generate: (prompt) => fetch('/api/script/generate', { ... }),
    // ...
  },
  // ...
}
```

## 🎯 Where to Change UI Safely

### Layout & Theme
- **Global Styles:** `app/globals.css`
- **Theme Colors:** `tailwind.config.ts`
- **Root Layout:** `app/layout.tsx`

### Navigation
- **Top Bar:** `components/TopBar.tsx`
- **Bottom Navigation:** `components/nav/BottomSwitcher.tsx`
- **Ribbons:** `components/NavRibbon.tsx`, `components/WorkspaceRibbon.tsx`

### Settings
- **Settings Page:** `app/settings/page.tsx`
- **Billing UI:** (to be added to settings)

### Workspace
- **Workspace Shell:** `components/layout/WorkspaceShell.tsx`
- **Workspace Frame:** `components/layout/WorkspaceFrame.tsx`
- **Panels:** `components/panels/*`

### Script Editor
- **Script Canvas:** `components/script-canvas/ScriptCanvas.tsx`
- **Script Lab:** `components/script/ScriptLab.tsx`
- **Chat:** `components/script/ChatInput.tsx`, `components/script/ChatThread.tsx`

### Character Studio
- **Character Panel:** `components/panels/CharactersPanel.tsx`
- **DNA Editor:** `components/CharacterDNASidebar.tsx`
- **Voice Tab:** `components/characters/VoiceTab.tsx`

## 🚀 Development Workflow

### Running Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in placeholder values (or leave as placeholders for demo mode)
3. Run `npm run dev`

### Building

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📝 Key Patterns

### Conditional Clerk

```typescript
const CLERK_ENABLED = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...'
)
```

### Zustand Store Pattern

```typescript
export const useMyStore = create<MyState>((set, get) => ({
  // State
  value: null,
  // Actions
  setValue: (value) => set({ value }),
}))
```

### Client Component Pattern

```typescript
'use client'

import { useState } from 'react'

export default function MyComponent() {
  // Component logic
}
```

---

**Last Updated:** Frontend overview for TrashFire v1.0
**Status:** Frontend complete, ready for backend integration


# TrashFire UI Architecture - Complete Documentation

## Table of Contents
1. [Application Structure](#application-structure)
2. [Page-by-Page Breakdown](#page-by-page-breakdown)
3. [Component Hierarchy](#component-hierarchy)
4. [State Management](#state-management)
5. [Button Actions & Workflows](#button-actions--workflows)
6. [Navigation Flow](#navigation-flow)
7. [Data Models](#data-models)

---

## Application Structure

### Root Layout (`app/layout.tsx`)
- **Purpose**: Wraps entire application
- **Structure**:
  - HTML wrapper with `dark` class
  - `ClientProviders` component (handles Clerk auth if enabled)
  - Global CSS (`globals.css`)
  - Inter font from Google Fonts
- **Metadata**: Title "TrashFire - Workspace Shell"

### Client Providers (`components/providers/ClientProviders.tsx`)
- **Purpose**: Conditionally wraps app with ClerkProvider if Clerk is enabled
- **Logic**: Checks for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variable
- **Fallback**: Renders children without Clerk if not configured

---

## Page-by-Page Breakdown

### 1. Home Page (`app/page.tsx`)
**Route**: `/`

#### Layout Structure:
```
- Background Effects (radial + conic gradients)
- Navigation Bar
- Hero Section
- Features Grid (3 cards)
- Recent Projects (if authenticated)
```

#### Components:
- **Navigation Bar**:
  - Logo (TrashFire logo image)
  - **Buttons**:
    - If authenticated: "Dashboard" → `/dashboard`, "Workspace" → `/workspace`
    - If not authenticated: "Sign In" → `/login` or `/sign-in`

- **Hero Section**:
  - Large TrashFire logo (animated with framer-motion)
  - Title: "Your AI Anime Studio" (gradient text)
  - Description text
  - **"Start New Project" Button**:
    - Action: `handleStartProject()`
    - If authenticated → navigates to `/workspace`
    - If not authenticated → navigates to sign-in page
    - Styled: Cyan background (`#00ffea`), black text, glowing shadow

- **Features Grid** (3 cards):
  1. **Episode Creation** (Film icon)
  2. **Character Studio** (Users icon)
  3. **Background Design** (Image icon)
  - Each card: Hover effects, border glow on hover

- **Recent Projects** (only if authenticated):
  - Grid of 3 mock project cards
  - Each card clickable → `/workspace?project={id}`
  - **"View All" Button** → `/dashboard`

#### State:
- Uses `useAuth()` hook to check authentication
- Uses `useRouter()` for navigation

---

### 2. Workspace Page (`app/workspace/page.tsx`)
**Route**: `/workspace`

#### Layout Structure:
```
- TopBar (fixed, sticky)
- BackgroundFX (animated background effects)
- ProWorkspaceLayout:
  - Left Panel: ProjectLab
  - Right Panel: InspectorPanel
  - Center Content: Mode-specific content
- BottomStack: SectionRibbon (desktop only)
- NewProjectModal (conditional)
```

#### State Management:
```typescript
- projectLabState: ProjectLabState (main state)
- mode: 'plan' | 'build' | 'preview'
- selected: SelectedTarget (currently selected item)
- showNewProjectModal: boolean
- activeRender: { episodeId, jobId } | null
- isClient: boolean (hydration check)
- authInitialized: boolean
```

#### Key Components:

**TopBar** (`components/TopBar.tsx`):
- Fixed sticky header
- Logo → `/`
- Navigation buttons: "Dashboard" → `/dashboard`, "Workspace" → `/workspace`
- ProModeToggle component
- User dropdown menu:
  - User avatar (initial letter)
  - "Settings" → `/settings`
  - "Sign Out" → calls `logout()` → redirects to `/`

**ModeSwitcher** (`components/workspace/ModeSwitcher.tsx`):
- Three mode buttons:
  1. **Plan** (FileText icon) - `mode = 'plan'`
  2. **Build** (Hammer icon) - `mode = 'build'`
  3. **Preview** (Play icon) - `mode = 'preview'`
- Active mode highlighted with cyan glow
- Saves to localStorage on change

**GuidedSteps** (`components/workspace/GuidedSteps.tsx`):
- Only visible in Plan mode
- 4-step workflow:
  1. **Write Script** - Always enabled, completed when script ≥ 30 chars
  2. **Generate Scene Plan** - Enabled when script ≥ 30 chars
     - Button action: `handleGenerateScenePlan()`
     - Generates mock scene plan, updates scenes to 'draft'
  3. **Auto-Fill Assets** - Enabled when scene plan exists
     - Button action: `handleAutoFillAssets()`
     - Auto-fills prompts for characters, locations, props
  4. **Preview Animatic** - Enabled when scenes have draft/locked status
     - Button action: `handlePreviewAnimatic()`
     - Sets `previewReady = true`

**ProjectLab** (`components/workspace/ProjectLab.tsx`):
- Left sidebar panel
- Shows 6 categories (collapsible):
  - Characters (Users icon)
  - Locations (MapPin icon)
  - Props (Package icon)
  - Scenes (Film icon)
  - Voices (Mic icon)
  - Episode (BookOpen icon)
- Each category shows:
  - Header with icon, label, completion badge (X/Y)
  - Expandable slot list
- Each slot card:
  - Title, prompt preview (if exists), status badge
  - **Click action**: Selects slot → updates InspectorPanel
  - **Edit Button**: Opens SlotEditModal
  - **Lock Button** (if draft): Sets status to 'locked'
  - **Unlock Button** (if locked): Sets status to 'draft'
- Selected slot highlighted with cyan border/glow

**InspectorPanel** (`components/workspace/InspectorPanel.tsx`):
- Right sidebar panel
- **When nothing selected**: Shows "No item selected" message
- **When slot/asset selected**:
  - **Header**:
    - Title, category badge, status badge
    - Quick actions: Focus, Duplicate, Delete
  - **Prompt Editor**:
    - Main prompt textarea (editable unless locked)
    - Negative prompt (collapsible accordion)
    - Seed input (optional number)
    - Revert button (restores last saved prompt)
  - **Style Locks** (4 toggles):
    - Lock Color Palette
    - Lock Line Weight
    - Lock Outfit
    - Lock Face
  - **Voice Assignment** (Characters only):
    - Dropdown: Nova, Rex, Mina, Kira
    - Preview button (mock toast)
  - **Placement** (Scene assets only):
    - Scale slider (50-200%)
    - X/Y number inputs
    - Rotation slider (-180° to 180°)
  - **Actions**:
    - **Generate Preview**: Sets status to 'draft', updates `lastGeneratedAt`, increments `usage.previewRerolls`
    - **Approve / Lock** (if draft): Sets status to 'locked'
    - **Unlock** (if locked): Sets status to 'draft'
  - **Studio Tips**: Category-specific suggestion chips (click to append to prompt)
- **Keyboard Shortcuts**:
  - `Esc`: Clear selection
  - `Ctrl/Cmd + L`: Lock/Unlock
  - `Enter` (in actions area): Generate Preview

**PlanModeContent** (`components/workspace/PlanModeContent.tsx`):
- Two-column layout:
  - **Script Editor**: Large textarea for script input
  - **Scene Plan Display**: Read-only textarea showing generated plan
- Script updates `projectLabState.scriptText` on change

**BuildModeContent** (`components/workspace/BuildModeContent.tsx`):
- **Available Assets** section (top):
  - Three columns: Characters, Locations, Props
  - Shows only non-empty assets
  - Draggable items
- **Scene Composition** section (bottom):
  - List of all scenes
  - Each scene shows:
    - Characters (badges, clickable to select)
    - Location (badge, clickable to select)
    - Props (badges, clickable to select)
    - Click-to-add buttons for each asset type
    - Remove buttons (X) on each asset
- **Drag & Drop**:
  - Drag assets from "Available Assets" → drop on scene
  - Updates `sceneCompositions[sceneId]`
- **Selection**: Clicking placed asset selects it → InspectorPanel shows placement controls

**PreviewModeContent** (`components/workspace/PreviewModeContent.tsx`):
- **Episode Preview Header**: Title, description, "Preview Mode" badge
- **Scene Cards Sequence**: List of all scenes with:
  - Scene number badge
  - Title, status badge, duration
  - Composition summary badges
  - Preview thumbnail (emoji)
- **Mock Player**: Play button, episode info, scene count

**SectionRibbon** (`components/workspace/SectionRibbon.tsx`):
- Bottom ribbon (desktop only)
- 6 tabs: Characters, Backgrounds, Voices, Scenes, Music, Episode
- Updates URL: `?section={key}`
- Updates workspace store `activeSection`
- Active tab highlighted with gradient underline

**NewProjectModal** (`components/workspace/NewProjectModal.tsx`):
- Triggered by "New Project" button
- Modal form (details not shown in code, but exists)

**ProWorkspaceLayout** (`components/workspace/ProWorkspaceLayout.tsx`):
- Three-panel layout:
  - Left panel: Collapsible (chevron button)
  - Right panel: Collapsible (chevron button)
  - Center: Main content area
- Mobile: Tab-based navigation (Canvas, Tree, Inspector, Timeline, Chat)
- Panel width: 280px expanded, 48px collapsed
- Smooth animations with framer-motion

---

### 3. Dashboard Page (`app/dashboard/page.tsx`)
**Route**: `/dashboard`

#### Layout:
- Header with "Projects" title
- Search bar (filters projects)
- Filter buttons (All, Active, Draft, Completed)
- Project grid (6 mock projects)
- Each project card:
  - Thumbnail image
  - Title, type badge, status badge
  - Last edited time
  - Click → `/workspace?project={id}`
- **"New Project" Button** (Plus icon) → Opens modal or navigates

#### Authentication:
- Redirects to sign-in if not authenticated
- Uses `useAuth()` hook

---

### 4. Login Page (`app/login/page.tsx`)
**Route**: `/login`

- Simple login form (mock authentication)
- Email/password inputs
- "Sign In" button → calls `login()` → redirects to `/dashboard`
- Link to sign-up page

---

### 5. Settings Page (`app/settings/page.tsx`)
**Route**: `/settings`

- User settings form
- Account management
- Preferences

---

### 6. Sign-In/Sign-Up Pages (`app/sign-in/[[...sign-in]]/page.tsx`)
**Route**: `/sign-in`, `/sign-up`

- Clerk authentication pages (if Clerk enabled)
- Otherwise redirects to `/login`

---

## Component Hierarchy

### Top-Level Components

```
RootLayout
└── ClientProviders
    └── [Page Component]
        ├── TopBar (if authenticated)
        ├── BackgroundFX
        └── [Page Content]
```

### Workspace Page Hierarchy

```
WorkspacePage
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

---

## State Management

### Auth State (`store/auth.ts`)
- **Store**: Zustand with persistence
- **State**:
  - `user: User | null`
  - `isAuthenticated: boolean`
- **Actions**:
  - `login(email, password)`: Mock login, sets user
  - `logout()`: Clears user, signs out from Clerk if enabled
  - `setUser(user)`: Updates user state
  - `syncWithClerk()`: Syncs with Clerk user

### Workspace State (`store/workspace.ts`)
- **Store**: Zustand
- **State**:
  - `activeSection: Section`
  - `project: ProjectMeta`
  - `status: string`
  - `taskProgress: TaskProgress | null`
  - `currentScript: ScriptBlock[]`
  - `episodeScaffold: EpisodeScaffold | null`
  - `characters: Character[]`
  - `sectionStates: Record<Section, any>`
- **Actions**:
  - `setSection(section)`: Changes active section
  - `setProject(project)`: Updates project metadata
  - `setStatus(status)`: Updates status
  - `setTaskProgress(progress)`: Updates task progress
  - `setCurrentScript(script)`: Updates script
  - `updateSceneBlock(sceneId, updates)`: Updates specific scene
  - `setEpisodeScaffold(scaffold)`: Sets episode scaffold
  - `setCharacters(characters)`: Updates characters
  - `updateCharacter(characterId, updates)`: Updates specific character
  - `assignVoiceToCharacter(characterId, voice)`: Assigns voice
  - `setSectionState(section, state)`: Updates section-specific state

### ProjectLab State (`lib/demo/projectLabTypes.ts`)
- **Type**: `ProjectLabState`
- **Structure**:
```typescript
{
  categories: {
    characters: SlotItem[]
    locations: SlotItem[]
    props: SlotItem[]
    scenes: SlotItem[]
    voices: SlotItem[]
    episode: SlotItem[]
  }
  scriptText: string
  scenePlanText: string
  previewReady: boolean
  sceneCompositions: Record<string, SceneComposition>
}
```

### SlotItem Structure
```typescript
{
  id: string
  title: string
  status: 'empty' | 'draft' | 'locked'
  prompt?: string
  negativePrompt?: string
  seed?: number
  previewUrl?: string
  locks?: {
    palette: boolean
    line: boolean
    outfit: boolean
    face: boolean
  }
  voiceId?: string
  usage?: {
    previewRerolls: number
  }
  lastGeneratedAt?: string
}
```

### SceneComposition Structure
```typescript
{
  characterIds: string[]
  locationId?: string
  propIds: string[]
  placements?: Record<string, {
    scale?: number
    x?: number
    y?: number
    rotation?: number
  }>
}
```

### SelectedTarget Type
```typescript
{ kind: 'slot'; categoryId: SlotCategory; slotId: string } |
{ kind: 'scene'; sceneId: string; assetRef: { categoryId: SlotCategory; slotId: string } } |
null
```

---

## Button Actions & Workflows

### Home Page Buttons

1. **"Start New Project"** (Hero section)
   - Action: `handleStartProject()`
   - If authenticated → `router.push('/workspace')`
   - If not → `router.push(getSignInUrl())`

2. **"Dashboard"** (Nav)
   - Action: `router.push('/dashboard')`

3. **"Workspace"** (Nav)
   - Action: `router.push('/workspace')`

4. **"Sign In"** (Nav)
   - Action: `router.push('/login')` or `/sign-in`

5. **"View All"** (Recent Projects)
   - Action: `router.push('/dashboard')`

6. **Project Cards** (Recent Projects)
   - Action: `router.push('/workspace?project={id}')`

### Workspace Page Buttons

1. **Mode Switcher Buttons** (Plan/Build/Preview)
   - Action: `setMode(mode)`
   - Saves to localStorage
   - Updates center content

2. **"New Project"** (Top right)
   - Action: `setShowNewProjectModal(true)`
   - Opens NewProjectModal

3. **GuidedSteps Buttons**:
   - **"Generate Scene Plan"**:
     - Validates script ≥ 30 chars
     - Generates mock scene plan
     - Updates scenes to 'draft' status
     - Sets `scenePlanText`
   - **"Auto-Fill Assets"**:
     - Requires scene plan exists
     - Generates mock prompts for characters, locations, props
     - Sets all to 'draft' status
   - **"Preview Animatic"**:
     - Requires scenes with draft/locked status
     - Sets `previewReady = true`

4. **ProjectLab Slot Actions**:
   - **Slot Card Click**: `onSelect({ kind: 'slot', categoryId, slotId })`
   - **Edit Button**: `setEditingSlot(slot)` → Opens SlotEditModal
   - **Lock Button**: `handleLockSlot(slotId)` → Sets status to 'locked'
   - **Unlock Button**: `handleUnlockSlot(slotId)` → Sets status to 'draft'
   - **Category Toggle**: Expands/collapses category

5. **InspectorPanel Actions**:
   - **Focus**: Shows toast (mock scroll to item)
   - **Duplicate**: Creates copy of slot with new ID, status='draft'
   - **Delete**:
     - If scene asset: Removes from scene composition
     - If slot: Clears prompt, sets status='empty' (only if empty/draft)
   - **Generate Preview**: Sets status='draft', updates `lastGeneratedAt`, increments `usage.previewRerolls`
   - **Approve / Lock**: Sets status='locked'
   - **Unlock**: Sets status='draft'
   - **Revert**: Restores `lastSavedPrompt`
   - **Studio Tips Chips**: Appends text to prompt textarea

6. **BuildModeContent Actions**:
   - **Drag Asset**: `handleDragStart()` → `handleDrop()` → Updates scene composition
   - **Click Add Button**: `handleClickAdd()` → Adds asset to scene
   - **Remove Asset (X)**: `handleRemoveAsset()` → Removes from composition
   - **Asset Badge Click**: `onSelect({ kind: 'scene', sceneId, assetRef })` → Selects for InspectorPanel

7. **TopBar Actions**:
   - **Logo**: `router.push('/')`
   - **Dashboard**: `router.push('/dashboard')`
   - **Workspace**: `router.push('/workspace')`
   - **Settings**: `router.push('/settings')`
   - **Sign Out**: `logout()` → `router.push('/')`

8. **SectionRibbon Tabs**:
   - Action: `onSelect(key)` → Updates URL `?section={key}` → Updates workspace store

### Dashboard Page Buttons

1. **Search Input**: Filters projects by title
2. **Filter Buttons**: Filter by status (All, Active, Draft, Completed)
3. **Project Cards**: `router.push('/workspace?project={id}')`
4. **"New Project"**: Opens modal or navigates

---

## Navigation Flow

### Unauthenticated User Flow:
```
Home (/) 
  → Click "Start New Project" 
  → Login (/login)
  → After login 
  → Dashboard (/dashboard)
```

### Authenticated User Flow:
```
Home (/)
  → Dashboard (/dashboard)
  → Workspace (/workspace)
  → Settings (/settings)
  → Sign Out → Home (/)
```

### Workspace Mode Flow:
```
Plan Mode
  → Write Script (≥30 chars)
  → Generate Scene Plan
  → Auto-Fill Assets
  → Preview Animatic
  → Switch to Build Mode
    → Drag/Add assets to scenes
    → Edit placements in Inspector
  → Switch to Preview Mode
    → View episode preview
```

---

## Data Models

### SlotCategory
```typescript
'characters' | 'locations' | 'props' | 'scenes' | 'voices' | 'episode'
```

### SlotStatus
```typescript
'empty' | 'draft' | 'locked'
```

### WorkspaceMode
```typescript
'plan' | 'build' | 'preview'
```

### Default ProjectLab State
- 2 Characters: Hero, Rival
- 2 Locations: Town, Hideout
- 2 Props: Weapon, Key Item
- 4 Scenes: Scene 1-4
- 2 Voices: Hero Voice, Rival Voice
- 1 Episode: Episode Overview
- All slots start with `status: 'empty'`

---

## Key Features

### Selection System
- Single source of truth: `selected` state in WorkspaceContent
- Can select: Slot from ProjectLab OR placed asset from Build mode
- Selection updates InspectorPanel
- Keyboard shortcuts work when item selected

### Status System
- **empty**: No prompt, not generated
- **draft**: Has prompt, editable, can generate preview
- **locked**: Finalized, read-only, cannot edit

### Lock System
- Style locks: 4 toggles (palette, line, outfit, face)
- Status lock: Prevents editing when 'locked'
- Unlock button restores editability

### Mock Generation
- All generation is UI-only (no API calls)
- Uses `generateMockScenePlan()` and `generateMockPrompts()`
- Toast notifications for user feedback

### Responsive Design
- Desktop: Three-panel layout with collapsible sidebars
- Mobile: Tab-based navigation (Canvas, Tree, Inspector, Timeline, Chat)
- SectionRibbon: Horizontal scroll on mobile, grid on desktop

---

## Styling System

### Color Palette
- Background: `#07090a` (dark)
- Panel: `#0a0f15` (slightly lighter)
- Accent: `#00ffea` (cyan)
- Accent Hover: `#00e6d1`
- Purple: `purple-500` (for locked status)
- White: Various opacities (10%, 20%, 40%, 60%, 80%)

### Effects
- Glow shadows: `shadow-[0_0_20px_rgba(0,255,234,0.3)]`
- Backdrop blur: `backdrop-blur-sm` / `backdrop-blur-xl`
- Border: `border-white/10`
- Gradients: Radial and conic for backgrounds

### Animations
- Framer Motion for page transitions
- Smooth panel collapse/expand
- Hover effects on interactive elements

---

## Keyboard Shortcuts

### InspectorPanel (when item selected)
- `Esc`: Clear selection
- `Ctrl/Cmd + L`: Lock/Unlock current item
- `Enter`: Generate Preview (when focused in actions area)

---

## Error Handling

- Authentication checks redirect to sign-in
- Demo mode auto-authenticates with DEMO_USER
- Loading states for async operations
- Toast notifications for user feedback
- Validation (e.g., script must be ≥30 chars for scene plan)

---

## File Structure Summary

```
app/
  ├── layout.tsx (root layout)
  ├── page.tsx (home)
  ├── dashboard/page.tsx
  ├── workspace/page.tsx (main workspace)
  ├── login/page.tsx
  ├── settings/page.tsx
  └── sign-in/[[...sign-in]]/page.tsx

components/
  ├── TopBar.tsx
  ├── providers/ClientProviders.tsx
  ├── workspace/
  │   ├── ProjectLab.tsx
  │   ├── InspectorPanel.tsx
  │   ├── ModeSwitcher.tsx
  │   ├── GuidedSteps.tsx
  │   ├── PlanModeContent.tsx
  │   ├── BuildModeContent.tsx
  │   ├── PreviewModeContent.tsx
  │   ├── ProWorkspaceLayout.tsx
  │   └── SectionRibbon.tsx
  └── ui/ (shadcn components)

store/
  ├── auth.ts (Zustand auth store)
  └── workspace.ts (Zustand workspace store)

lib/
  └── demo/
      ├── projectLabTypes.ts (types)
      └── projectLabSeed.ts (default state + mock generators)
```

---

This documentation covers the complete UI structure, all pages, components, buttons, and their behaviors. Every interaction is explained with its purpose and effect on the application state.


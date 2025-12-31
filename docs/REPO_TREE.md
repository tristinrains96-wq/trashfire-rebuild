# TrashFire Repository Tree

Complete directory structure (depth 4) of the TrashFire codebase.

## Directory Tree

```
TrashFire Production/
├── app/                                    # Next.js App Router (Frontend Routes)
│   ├── approval/
│   │   └── [id]/
│   │       └── page.tsx                   # Episode approval page
│   ├── dashboard/
│   │   └── page.tsx                       # User dashboard
│   ├── edit/
│   │   └── [id]/
│   │       └── page.tsx                   # Episode editor
│   ├── globals.css                        # Global styles
│   ├── healthz/
│   │   └── route.ts                        # Health check endpoint
│   ├── layout.tsx                          # Root layout
│   ├── login/
│   │   └── page.tsx                       # Demo login page
│   ├── page.tsx                            # Home/landing page
│   ├── settings/
│   │   └── page.tsx                       # User settings
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx                   # Clerk sign-in
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx                   # Clerk sign-up
│   └── workspace/                          # Main workspace (core app)
│       ├── page.tsx                        # Workspace shell
│       ├── scenes/
│       │   └── page.tsx                   # Scene builder section
│       └── script/
│           └── page.tsx                    # Script editor section
│
├── components/                             # React Components
│   ├── characters/
│   │   └── VoiceTab.tsx                   # Character voice tab
│   ├── episode/
│   │   └── SceneCard.tsx                  # Episode scene card
│   ├── layout/                             # Layout components
│   │   ├── BackgroundFX.tsx              # Animated background
│   │   ├── BottomStack.tsx                # Bottom stack container
│   │   ├── VerticalSidebar.tsx            # Vertical sidebar
│   │   ├── WorkspaceFrame.tsx             # Workspace frame
│   │   └── WorkspaceShell.tsx              # Workspace shell
│   ├── nav/
│   │   └── BottomSwitcher.tsx             # Bottom navigation switcher
│   ├── panels/                             # Side panels
│   │   ├── BackgroundsPanel.tsx           # Backgrounds panel
│   │   ├── CharactersPanel.tsx           # Characters panel
│   │   ├── EpisodePanel.tsx              # Episode panel
│   │   ├── MusicPanel.tsx                # Music panel
│   │   ├── ScenesPanel.tsx                # Scenes panel
│   │   └── VoicesPanel.tsx                # Voices panel
│   ├── providers/
│   │   └── ClientProviders.tsx            # ClerkProvider wrapper
│   ├── scenes/                             # Scene components
│   │   ├── ScenesPreviz.tsx               # Scene preview
│   │   └── StoryboardStrip.tsx            # Storyboard strip
│   ├── script/                             # Script components
│   │   ├── ChatInput.tsx                  # Chat input
│   │   ├── ChatThread.tsx                 # Chat thread
│   │   ├── EntityMappingModal.tsx         # Entity mapping modal
│   │   ├── SceneBlock.tsx                 # Scene block
│   │   ├── ScriptHub.tsx                  # Script hub
│   │   └── ScriptLab.tsx                  # Script lab
│   ├── script-canvas/                      # Script canvas components
│   │   ├── AdaptiveButton.tsx             # Adaptive button
│   │   ├── BeatTimeline.tsx               # Beat timeline
│   │   ├── CanvasBody.tsx                 # Canvas body
│   │   ├── CanvasFooter.tsx               # Canvas footer
│   │   ├── CanvasHeader.tsx                # Canvas header
│   │   ├── CanvasSidebar.tsx              # Canvas sidebar
│   │   ├── CanvasTopBar.tsx                # Canvas top bar
│   │   ├── OutlineTree.tsx                # Outline tree
│   │   ├── PlanPanel.tsx                  # Plan panel
│   │   ├── SceneCards.tsx                 # Scene cards
│   │   └── ScriptCanvas.tsx               # Main script canvas
│   ├── stage/                              # Generation/stage components
│   │   ├── ChatMessage.tsx                 # Chat message
│   │   ├── ChatStream.tsx                  # Chat stream
│   │   ├── ContextHUD.tsx                  # Context HUD
│   │   ├── FloatingActionBar.tsx          # Floating action bar
│   │   ├── GenBox.tsx                      # Generation box
│   │   ├── InlineTaskCard.tsx              # Inline task card
│   │   └── InlineTaskChip.tsx              # Inline task chip
│   ├── studio/                             # Studio mode components
│   │   ├── stages/                         # Stage components
│   │   │   ├── BackgroundsStage.tsx      # Backgrounds stage
│   │   │   ├── CharactersStage.tsx         # Characters stage
│   │   │   ├── EpisodeStage.tsx            # Episode stage
│   │   │   ├── ScenesStage.tsx             # Scenes stage
│   │   │   ├── ScriptStage.tsx             # Script stage
│   │   │   └── VoicesStage.tsx             # Voices stage
│   │   ├── StudioCanvas.tsx                # Studio canvas
│   │   └── StudioInit.tsx                   # Studio initialization
│   ├── ui/                                 # shadcn/ui components
│   │   ├── badge.tsx                       # Badge component
│   │   ├── button.tsx                      # Button component
│   │   ├── card.tsx                        # Card component
│   │   ├── carousel.tsx                    # Carousel component
│   │   ├── drawer.tsx                      # Drawer component
│   │   ├── dropdown-menu.tsx               # Dropdown menu
│   │   ├── input.tsx                       # Input component
│   │   ├── label.tsx                       # Label component
│   │   ├── Portal.tsx                      # Portal component
│   │   ├── progress.tsx                   # Progress component
│   │   ├── select.tsx                      # Select component
│   │   ├── separator.tsx                   # Separator component
│   │   ├── slider.tsx                      # Slider component
│   │   ├── switch.tsx                      # Switch component
│   │   ├── tabs.tsx                        # Tabs component
│   │   ├── textarea.tsx                    # Textarea component
│   │   └── tooltip.tsx                     # Tooltip component
│   ├── workspace/                          # Workspace components
│   │   ├── panes/                          # Section panes
│   │   │   ├── BackgroundsPane.tsx        # Backgrounds pane
│   │   │   ├── CharactersPane.tsx         # Characters pane
│   │   │   ├── EpisodePane.tsx             # Episode pane
│   │   │   ├── ScenesPane.tsx              # Scenes pane
│   │   │   ├── ScriptPane.tsx              # Script pane
│   │   │   └── VoicesPane.tsx              # Voices pane
│   │   ├── AssetGallery.tsx                # Asset gallery
│   │   ├── AssetSidebar.tsx                # Asset sidebar
│   │   ├── BuildModeContent.tsx            # Build mode content
│   │   ├── ErrorNotice.tsx                 # Error notice
│   │   ├── ExportActions.tsx               # Export actions
│   │   ├── GenBox.tsx                      # Generation box
│   │   ├── GuidedSteps.tsx                 # Guided steps wizard
│   │   ├── InspectorPanel.tsx             # Inspector panel
│   │   ├── Keyboard.tsx                    # Keyboard component
│   │   ├── ModeSwitcher.tsx                # Mode switcher
│   │   ├── NewProjectModal.tsx             # New project modal
│   │   ├── PlanModeContent.tsx             # Plan mode content
│   │   ├── PreviewModeContent.tsx         # Preview mode content
│   │   ├── ProgressBar.tsx                 # Progress bar
│   │   ├── ProgressLoader.tsx              # Progress loader
│   │   ├── ProjectLab.tsx                 # Project lab
│   │   ├── ProWorkspaceLayout.tsx         # Pro workspace layout
│   │   ├── SectionRibbon.tsx               # Section ribbon
│   │   ├── SectionTabs.tsx                 # Section tabs
│   │   ├── SlotEditModal.tsx               # Slot edit modal
│   │   ├── WorkspaceCanvas.tsx             # Workspace canvas
│   │   └── WorkspaceLoading.tsx            # Workspace loading
│   ├── BackgroundsPageContent.tsx         # Backgrounds page content
│   ├── BottomDock.tsx                      # Bottom dock
│   ├── CharacterDNASidebar.tsx             # Character DNA sidebar
│   ├── CharactersPageContent.tsx           # Characters page content
│   ├── CharacterTimeline.tsx               # Character timeline
│   ├── KeyboardTray.tsx                   # Keyboard tray
│   ├── NavRibbon.tsx                       # Navigation ribbon
│   ├── PreviewBox.tsx                      # Preview box
│   ├── ProModeToggle.tsx                   # Pro mode toggle
│   ├── RibbonNav.tsx                       # Ribbon navigation
│   ├── SectionRibbon.tsx                   # Section ribbon
│   ├── SlideContainer.tsx                  # Slide container
│   ├── TopBar.tsx                          # Top bar
│   ├── WorkspaceRibbon.tsx                  # Workspace ribbon
│   └── WorkspaceShell.tsx                   # Workspace shell
│
├── docs/                                   # Documentation
│   ├── BACKEND_OVERVIEW.md                 # Backend architecture
│   ├── FRONTEND_OVERVIEW.md                # Frontend architecture
│   ├── GENERATION_INTEGRATION_PLAN.md      # Generation integration plan
│   ├── REPO_MAP.md                         # Repository map
│   ├── REPO_TREE.md                        # This file
│   ├── STACK_V1_LOCKED.md                  # Locked v1 stack
│   └── UI_ENTRYPOINTS.md                   # UI entrypoints
│
├── flows/                                  # Flow Controllers
│   └── StudioFlowController.ts             # Studio flow controller
│
├── hooks/                                  # Custom React Hooks
│   ├── useGenBox.ts                        # Generation box hook
│   ├── useScriptAI.ts                      # Script AI hook
│   ├── useScriptEntityDetector.ts          # Entity detector hook
│   └── useScriptPlan.ts                    # Script plan hook
│
├── lib/                                    # Core Libraries & Utilities
│   ├── demo/                               # Demo mode utilities
│   │   ├── projectLabSeed.ts              # Project lab seed data
│   │   └── projectLabTypes.ts             # Project lab types
│   ├── prompts/                            # Prompt templates
│   │   └── episodeTemplates.ts            # Episode templates
│   ├── schemas/                            # Zod schemas
│   │   ├── episodeSchema.ts               # Episode schema
│   │   └── productionSchema.ts            # Production schema
│   ├── audio_engine.ts                     # Audio engine (stub)
│   ├── auth.ts                             # Auth utilities
│   ├── billing.ts                          # Billing integration
│   ├── chat-bus.ts                         # Event bus
│   ├── demoAuth.ts                         # Demo authentication
│   ├── demoMode.ts                         # Demo mode detection
│   ├── guardrails.ts                       # Guardrails logic
│   ├── mockAssets.ts                       # Mock assets
│   ├── mockData.ts                         # Mock data
│   ├── mockScriptLLM.ts                    # Mock LLM responses
│   ├── pod-manager.ts                      # Pod manager (stub)
│   ├── render_engine.ts                    # Render engine (stub)
│   ├── storage.ts                          # Storage utilities
│   ├── supabase.ts                         # Supabase client (stub)
│   ├── toast.ts                            # Toast notifications
│   ├── utils.ts                            # General utilities
│   └── video_engine.ts                     # Video engine (stub)
│
├── public/                                 # Static Assets
│   ├── mock/
│   │   └── preview.svg                     # Mock preview
│   ├── workers/
│   │   └── script-entity-detector.js       # Entity detector worker
│   ├── logo.jpg                            # Logo
│   ├── trashfire-logo.png                  # TrashFire logo (PNG)
│   └── trashfire-logo.svg                  # TrashFire logo (SVG)
│
├── scripts/                                # Utility Scripts
│   ├── install_ffmpeg_windows.bat          # FFmpeg installer (batch)
│   ├── install_ffmpeg_windows.ps1          # FFmpeg installer (PowerShell)
│   ├── install_ffmpeg_windows_auto.ps1     # FFmpeg auto installer
│   ├── mobile_stress_test.html             # Mobile stress test
│   ├── open.js                             # Open script
│   ├── phase1_acceptance_test.ts           # Phase 1 tests
│   ├── phase2_5_test.ts                    # Phase 2.5 tests
│   ├── phase2_acceptance_test.ts           # Phase 2 acceptance tests
│   ├── phase2_test.ts                       # Phase 2 tests
│   ├── public_check.ts                     # Public branch checker
│   ├── public_secret_scan.ts               # Public secret scanner
│   ├── run_phase2_5_check.ts               # Phase 2.5 check runner
│   ├── scan_secrets.ts                     # Secret scanner (TypeScript)
│   ├── scan_secrets.ps1                    # Secret scanner (PowerShell)
│   ├── smoke.mjs                           # Smoke tests
│   ├── stress_test.ps1                     # Stress test (PowerShell)
│   └── stress_test_week3.ts                # Week 3 stress test
│
├── store/                                  # Zustand State Management
│   ├── auth.ts                             # Authentication state
│   ├── sceneStore.ts                       # Scene state
│   ├── scriptLab.ts                        # Script lab state
│   ├── useStudioStore.ts                   # Studio store
│   └── workspace.ts                        # Workspace state
│
├── styles/                                 # Styling
│   ├── motion.ts                           # Framer Motion variants
│   └── style-packs.ts                      # Style pack definitions
│
├── types/                                  # TypeScript Types
│   └── index.ts                            # Type definitions
│
├── .eslintrc.json                          # ESLint config
├── .gitignore                              # Git ignore rules
├── .prettierrc                             # Prettier config
├── CONTRIBUTING_PUBLIC.md                   # Contributing guide
├── middleware.ts                           # Next.js middleware
├── next.config.js                          # Next.js config
├── next-env.d.ts                           # Next.js types
├── package.json                            # Dependencies
├── package-lock.json                       # Lock file
├── postcss.config.js                       # PostCSS config
├── README.md                               # Main README
├── README_PUBLIC.md                        # Public branch README
├── SECURITY.md                             # Security guidelines
├── SECURITY_PUBLIC.md                      # Public security statement
├── tailwind.config.ts                      # Tailwind config
├── tsconfig.json                           # TypeScript config
├── tsconfig.tsbuildinfo                    # TypeScript build info
├── UI_ARCHITECTURE_DOCUMENTATION.md        # UI architecture docs
├── UI_UX_NOTES.md                          # UI/UX notes
└── vercel.json                             # Vercel config
```

## Key Folders

### `app/`
**Next.js App Router** - All frontend routes and pages. Uses Next.js 14 App Router pattern with `page.tsx` files for routes and `layout.tsx` for layouts.

### `components/`
**React Components** - All reusable React components organized by feature:
- `layout/` - Layout shell components (WorkspaceShell, WorkspaceFrame, etc.)
- `workspace/` - Workspace-specific components (ProjectLab, InspectorPanel, etc.)
- `script-canvas/` - Script editor canvas components
- `panels/` - Side panel components (CharactersPanel, ScenesPanel, etc.)
- `ui/` - shadcn/ui primitive components (Button, Card, Input, etc.)
- `stage/` - Generation/stage UI components
- `studio/` - Studio mode components

### `lib/`
**Core Libraries** - Utility functions, engines, and integrations:
- `demo/` - Demo mode utilities and mock data
- `schemas/` - Zod validation schemas
- `prompts/` - AI prompt templates
- Engine stubs: `video_engine.ts`, `audio_engine.ts`, `render_engine.ts`
- Integration stubs: `supabase.ts`, `pod-manager.ts`
- Utilities: `auth.ts`, `billing.ts`, `guardrails.ts`

### `store/`
**Zustand State Management** - Global state stores:
- `auth.ts` - Authentication state
- `workspace.ts` - Workspace state (sections, project, script, characters)
- `scriptLab.ts` - Script lab state (outline, beats, chat)
- `useStudioStore.ts` - Studio mode state
- `sceneStore.ts` - Scene-specific state

### `hooks/`
**Custom React Hooks** - Reusable hooks for common patterns:
- `useGenBox.ts` - Generation box state
- `useScriptAI.ts` - Script AI interactions
- `useScriptEntityDetector.ts` - Entity detection
- `useScriptPlan.ts` - Plan generation

### `scripts/`
**Utility Scripts** - Development and maintenance scripts:
- Secret scanners: `scan_secrets.ts`, `scan_secrets.ps1`, `public_secret_scan.ts`
- Test scripts: `phase1_acceptance_test.ts`, `phase2_test.ts`, etc.
- FFmpeg installers: `install_ffmpeg_windows.*`

### `docs/`
**Documentation** - Project documentation and guides

### `public/`
**Static Assets** - Images, logos, web workers, and other static files

### `styles/`
**Styling** - Global styles, motion variants, and style pack definitions

### `types/`
**TypeScript Types** - Shared type definitions

### `flows/`
**Flow Controllers** - Business logic for complex flows (Studio mode)

---

**Generated:** From `git ls-files | sort` output
**Last Updated:** Repository tree snapshot for public review


# TrashFire - AI-Powered Anime Production Platform

**Grok-style chat for long-form anime videos.** Create 5–15 minute episodes with series continuity through the easiest controls: chat → auto-assets → tweak → render.

## Vision

TrashFire is a professional, affordable, and profitable production app for creating long-form anime content. Built for creators who want cinematic quality without the complexity.

### Core Experience

- **Grok-Style Chat Interface**: Natural language script generation with context awareness
- **Long-Form Content**: 5–15 minute episodes with full series continuity
- **Easiest Controls**: Chat → Auto-Assets → Tweak → Render workflow
- **Cloud Backend**: Groq LLM, RunPod/Vast.ai SVD video, ElevenLabs TTS
- **Production Standards**: 99.9% uptime, <5s response times, 85% consistency

### Production Goals

- **Affordability**: $0.50–$2 per episode cost
- **Profitability**: $10K/month revenue goal at $20 ARPU
- **Quality**: Professional-grade output with customizable presets
- **Reliability**: Enterprise-grade uptime and performance

## Features

- **Cinematic UI**: Neon teal-on-black theme with glowing accents (#00ffea)
- **Workspace Shell**: Complete workspace interface with panels for Characters, Backgrounds, Voices, Scenes, Music, and Episode management
- **Responsive Design**: Optimized for desktop (≥1440×900) and mobile (390×844)
- **Quality Presets**: LOW (720p/24fps) and HIGH (1080p/30fps) cloud rendering modes
- **Billing Integration**: Stripe-ready with disabled/mock/live modes
- **Interactive Components**: Built with shadcn/ui components and Framer Motion animations
- **Modern Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS

## Theme

The application uses a custom teal-on-black theme with the following color tokens:

- **Background**: #0A0C0D
- **Surface**: #111416  
- **Accent**: #00F5D4 (primary), #4BE5D2 (soft), #00FFEA (neon glow)
- **Text**: #E8E8E8 (primary), #A0A0A0 (secondary), #585858 (disabled)
- **Glow Effect**: 0 0 20px rgba(0,255,234,0.30)

## One-click Run

### Quick Start (Recommended)

- **macOS**: Double-click `Run TrashFire.command` (first time may require: `chmod +x "Run TrashFire.command"`)
- **Windows**: Double-click `Run TrashFire.bat`
- **Manual**: Run `pnpm run dev:open` (or `npm run dev:open`)

### Health Check & Testing

- **Health Check**: http://localhost:3000/healthz
- **Smoke Test**: `pnpm smoke` (or `npm run smoke`)
- **Stress Test**: `powershell -ExecutionPolicy Bypass -File scripts/stress_test.ps1`

### Troubleshooting

- Free port 3000 if it's in use
- Ensure Node.js 18+ is installed
- Delete `.next/.turbo` and retry if build issues occur

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
pnpm install
# or
npm install

# Start development server
pnpm dev
# or
npm run dev
```

### Access Points

- **Main App**: http://localhost:3000
- **Workspace**: http://localhost:3000/workspace  
- **Health Check**: http://localhost:3000/healthz

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with theme
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── workspace/         # Workspace page
│   └── healthz/           # Health check endpoint
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── panels/           # Workspace panel components
│   ├── TopBar.tsx        # Sticky top navigation
│   ├── PreviewBox.tsx    # Main preview area
│   ├── SlideContainer.tsx # Panel navigation
│   └── KeyboardTray.tsx  # Bottom input area
├── lib/                   # Utilities
│   ├── utils.ts          # Quality presets and utilities
│   └── billing.ts        # Billing integration (Stripe)
├── scripts/              # Utility scripts
│   └── stress_test.ps1   # Stress testing script
└── public/mock/          # Placeholder assets
```

## Components

### Workspace Panels

- **Characters**: Turntable views and version timeline
- **Backgrounds**: Environment grid with lighting controls  
- **Voices**: Voice tiles with preview functionality
- **Scenes**: Storyboard strip and motion controls
- **Music**: Track tiles with waveform visualization
- **Episode**: Production checklist and spark estimator

### Key Features

- **Sticky Navigation**: TopBar and KeyboardTray stay visible
- **Responsive Design**: Adapts to desktop and mobile viewports
- **Smooth Animations**: Framer Motion for panel transitions
- **Accessibility**: ARIA labels and keyboard navigation
- **Theme Integration**: All components use custom theme tokens
- **85% Canvas Default**: Optimized workspace layout with collapsible panels

## Scripts

- `pnpm dev` - Start development server on port 3000
- `pnpm dev:open` - Start dev server and auto-open browser when ready
- `pnpm smoke` - Run health check and smoke tests
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Health Check

The application includes a health check endpoint at `/healthz` that returns:

```json
{
  "status": "ok",
  "services": ["web"]
}
```

## Cloud Pivot

**Cloud Stack**: Groq LLM, RunPod/Vast.ai SVD video, ElevenLabs TTS. See [PLAN_v4.md](./PLAN_v4.md) for details.

## Production Plan

See [PRODUCTION_PLAN.md](./PRODUCTION_PLAN.md) for detailed implementation phases, benchmarks, and roadmap.

## Notes

- All icons include proper ARIA labels for accessibility
- Components include loading, error, and empty states
- Mobile keyboard handling with safe area padding
- No external images - uses placeholder SVG
- Strictly teal-on-black theme with neon #00ffea glow
- Quality presets optimize for cost vs. quality tradeoffs
- Billing system supports disabled/mock/live modes for development

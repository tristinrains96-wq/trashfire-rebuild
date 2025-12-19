# TrashFire - Public UI Demo Branch

This is a **UI-only demo branch** of TrashFire, an AI-powered anime episode creation tool. This branch contains **zero secrets, zero API endpoints, and zero backend logic** - it's purely for reviewing the UI/UX and workflows.

## ⚠️ Important

- **This is a DEMO branch** - generation, rendering, and all AI features are disabled
- **No API keys required** - runs entirely with mock data
- **No backend dependencies** - no Supabase, no Clerk (demo auth only), no external services
- **Safe for public review** - all secrets and sensitive code have been removed

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

4. **Demo Login:**
   - The app runs in demo mode automatically
   - No authentication required - you're automatically logged in as "Demo User"
   - All data is mock data from `lib/mockData.ts`

## 📁 What's Included

### UI Components
- Full workspace interface
- Script editor and canvas
- Character management UI
- Scene builder
- Episode approval interface
- Settings and dashboard

### Mock Data
- 2 example Projects
- 1 example Episode with 3 scenes
- 3 example Characters
- 5 example Backgrounds
- 3 example Props

### Demo Features
- All UI flows are functional
- Navigation works between all sections
- Forms and inputs accept data (stored in local state)
- Generation buttons show "Demo Mode" messages

## 🚫 What's NOT Included

- `/app/api` - All API routes removed
- `/supabase` - Database schema and migrations removed
- `/jobs` - Background job processing removed
- `/lib/providers` - External service integrations removed
- Setup pages - Connection testing removed
- Real authentication - Uses demo auth only

## 🔒 Security

This branch has been scanned for secrets using `npm run public:scan`. All API keys, tokens, and sensitive data have been removed.

## 🧪 Safety Checks

Before making this branch public, run:

```bash
npm run public:check
```

This will:
1. Scan for any remaining secrets
2. Verify the build compiles successfully

## 📝 Review Checklist

When reviewing this UI:

- [ ] Dashboard loads and shows mock projects
- [ ] Workspace navigation works between sections
- [ ] Script editor renders and accepts input
- [ ] Character panel displays mock characters
- [ ] Scene builder shows mock scenes
- [ ] Generation buttons show demo mode messages
- [ ] Settings page loads (no API key management)
- [ ] Approval page displays mock episode data
- [ ] Mobile responsive (test on 375px width)
- [ ] No console errors in browser

## 🎨 UI/UX Notes

See `UI_UX_NOTES.md` for detailed review guidelines and screenshots checklist.

## 🤝 Contributing

See `CONTRIBUTING_PUBLIC.md` for how to suggest UI improvements.

## 📄 License

See the main repository for license information.

---

**Note:** This is a stripped-down demo version. The full production version includes:
- Real AI generation (Groq Llama 3.1 8B)
- Video rendering (SDXL + SVD)
- Audio synthesis (ElevenLabs)
- Database persistence (Supabase)
- User authentication (Clerk)
- Billing integration (Stripe)

All of these features are intentionally removed from this public branch.


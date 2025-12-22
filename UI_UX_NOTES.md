# TrashFire UI/UX Review Notes

This document outlines what to review in the public UI demo branch.

## 🎯 Review Goals

1. **Workflow Clarity** - Can users understand how to create an episode?
2. **Visual Hierarchy** - Is the most important information prominent?
3. **Navigation** - Can users easily move between sections?
4. **Mobile Experience** - Does it work well on 375px screens?
5. **Feedback** - Do users understand what's happening?

## 📸 Screenshots Checklist

### Dashboard (`/dashboard`)
- [ ] Projects grid displays correctly
- [ ] Search bar is visible and functional
- [ ] "New Project" button is prominent
- [ ] Project cards show status badges
- [ ] Thumbnails load (or show placeholder)

### Workspace (`/workspace`)
- [ ] Top bar navigation works
- [ ] Section ribbon is visible (desktop)
- [ ] Left sidebar (asset tree) renders
- [ ] Right sidebar (inspector) renders
- [ ] Canvas area is visible
- [ ] "New Project" modal opens

### Script Section (`/workspace/script`)
- [ ] Script canvas loads
- [ ] Chat input is visible
- [ ] Outline/beats/scenes tabs work
- [ ] Scene cards display
- [ ] "Analyze & Map" button shows demo message
- [ ] Entity detection UI renders

### Characters Section (`/workspace/characters`)
- [ ] Character list displays
- [ ] Character timeline shows versions
- [ ] DNA sidebar opens
- [ ] Voice assignment UI works
- [ ] Assist buttons show demo messages

### Scenes Section (`/workspace/scenes`)
- [ ] Scene list/grid displays
- [ ] Scene cards show mock data
- [ ] Preview box works
- [ ] Timeline/storyboard renders

### Approval Page (`/approval/[id]`)
- [ ] Episode details display
- [ ] Asset list shows mock assets
- [ ] Lock/unlock buttons visible
- [ ] Usage stats show (mock)
- [ ] Render buttons show demo messages

### Settings (`/settings`)
- [ ] Account info displays
- [ ] Appearance toggle works
- [ ] API Keys section shows demo message
- [ ] Billing section shows "coming soon"

## 🎨 Design Review

### Colors
- Primary accent: `#00ffea` (cyan) - used for CTAs
- Background: `#07090a` (dark) - main background
- Cards: `#0a0f15/80` (semi-transparent dark)
- Text: White with opacity variants

### Typography
- Font: Inter (Google Fonts)
- Headings: Bold, white
- Body: Regular, white/60-80 opacity
- Code/Inputs: Monospace

### Spacing
- Container padding: `px-6 py-8`
- Card padding: `p-4` or `p-6`
- Gap between items: `gap-4` or `gap-6`

### Components
- Buttons: Rounded, with hover states
- Cards: Rounded corners, border `white/10`
- Inputs: Dark background, cyan focus ring
- Modals: Backdrop blur, centered

## 📱 Mobile Considerations

Test on **375px width** (iPhone SE size):

- [ ] No overlapping elements
- [ ] Touch targets are at least 44px
- [ ] Text is readable (min 14px)
- [ ] Navigation is accessible
- [ ] Forms are usable
- [ ] Modals fit on screen
- [ ] Bottom dock is accessible

## 🔄 User Flows

### Creating an Episode
1. Dashboard → Click "New Project"
2. Workspace → Enter idea in chat
3. Script → Review outline/beats
4. Characters → Assign voices
5. Scenes → Review scene cards
6. Approval → Lock assets and render

**Note:** In demo mode, steps 2-6 show demo messages instead of actual generation.

### Editing a Scene
1. Workspace → Navigate to Scenes section
2. Click on a scene card
3. Edit dialogue/notes
4. Assign characters/backgrounds
5. Save changes

## 🐛 Known Demo Limitations

- **No persistence** - Changes are lost on refresh (local state only)
- **No generation** - All AI features show demo messages
- **No rendering** - Video/audio generation disabled
- **No real auth** - Always logged in as "Demo User"
- **Mock data only** - Can't create new projects/episodes

## 💡 Suggestions for Improvement

When reviewing, consider:

1. **Onboarding** - Is it clear what to do first?
2. **Feedback** - Do users know when actions succeed/fail?
3. **Error states** - What happens when something goes wrong?
4. **Loading states** - Are spinners/placeholders clear?
5. **Accessibility** - Keyboard navigation, screen readers
6. **Performance** - Any lag or jank?

## 📝 Feedback Format

When providing feedback:

```
**Component:** [Component Name]
**Issue:** [Brief description]
**Severity:** [Critical / High / Medium / Low]
**Steps to Reproduce:** [If applicable]
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Screenshot:** [If applicable]
```

---

**Remember:** This is a UI demo. Focus on visual design, workflows, and user experience, not functionality (which is intentionally disabled).



# Security Checklist - Week 3

## ✅ API Keys
- [x] All API keys use `'your_key_here'` placeholder
- [x] No real keys committed to repository
- [x] `.gitignore` includes `.env*` files
- [x] Environment variables loaded from `.env.local` only

## ✅ Authentication
- [x] Clerk middleware protects all generation endpoints
- [x] `/api/outline`, `/api/pipeline/*`, `/api/episodes/*/render` require auth
- [x] `requireAuth()` helper validates user on all protected routes

## ✅ Rate Limiting
- [x] Rate limit: 10 jobs/min per user (implemented in `lib/auth.ts`)
- [x] Rate limit enforced on `/api/episodes/[id]/render`
- [x] Returns 429 status with remaining count when exceeded

## ✅ Error Handling
- [x] Queue retries: 3 attempts with exponential backoff
- [x] Fallback mocks if services unavailable
- [x] Clear UI error notices (`ErrorNotice.tsx`)

## ✅ Public Repository Safety
- [x] No secrets in code
- [x] No hardcoded credentials
- [x] All sensitive config via environment variables
- [x] `.env` files gitignored

## Deployment Checklist
- [ ] Set all environment variables in Vercel dashboard
- [ ] Enable Clerk authentication
- [ ] Configure Redis (Upstash or similar)
- [ ] Set up Stripe webhook endpoint
- [ ] Test health endpoint: `/api/health`
- [ ] Verify rate limits in production


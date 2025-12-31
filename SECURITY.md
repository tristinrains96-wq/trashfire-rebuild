# Security Guidelines for TrashFire

This document outlines security best practices for the TrashFire repository. **This is a public repository** - zero tolerance for secrets.

## 🚨 Critical Rules

### Never Commit Secrets

**DO NOT commit:**
- API keys (Groq, ElevenLabs, RunPod, Vast.ai, Stripe, Clerk, Supabase)
- Private keys (`.pem`, `.key`, `.p12` files)
- Service account JSON files
- `.env` files (any variant: `.env`, `.env.local`, `.env.production`, etc.)
- Database connection strings with credentials
- JWT secrets or tokens
- Webhook secrets

**ALWAYS use:**
- `.env.example` for placeholder values
- Environment variables for actual keys
- `.gitignore` to exclude sensitive files

## 🔍 Secret Detection

### Automated Scanning

We provide automated secret scanning:

**TypeScript/Node.js:**
```bash
npm run public:scan
```

**Windows PowerShell:**
```powershell
.\scripts\scan_secrets.ps1
```

**Manual Check:**
- Review all commits before pushing
- Check for common patterns: `sk_`, `pk_`, `whsec_`, `eyJ`, `-----BEGIN`
- Verify `.env*` files are in `.gitignore`

### What Gets Scanned

The scanner looks for:
- Clerk keys: `pk_test_*`, `pk_live_*`, `sk_test_*`, `sk_live_*`
- Supabase keys: `sb_*`, JWT tokens
- API keys: `sk-*`, `sk-ant-*`
- Service role keys
- Environment variables with long secret-like values

## 🛡️ If a Secret Was Committed

### Immediate Actions

1. **Rotate the exposed key immediately**
   - Log into the service (Clerk, Stripe, Groq, etc.)
   - Revoke the exposed key
   - Generate a new key
   - Update your local `.env.local` with the new key

2. **Do NOT attempt to rewrite git history automatically**
   - History rewriting can cause issues for collaborators
   - Instead, document the incident

3. **Optional: Clean Git History (Advanced)**
   If you must remove secrets from history:
   ```bash
   # Install git-filter-repo
   pip install git-filter-repo
   
   # Remove secret from all commits
   git filter-repo --replace-text <(echo "OLD_SECRET==>NEW_PLACEHOLDER")
   ```
   **Warning:** This rewrites history. Coordinate with team before doing this.

### Reporting

If you discover a secret in the repository:
1. **DO NOT** create a public issue
2. Contact the maintainer directly
3. Include:
   - File path and line number
   - Type of secret (API key, token, etc.)
   - When it was committed (if known)

## 📋 Pre-Commit Checklist

Before committing, verify:
- [ ] No `.env*` files are staged
- [ ] No API keys in code (only placeholders)
- [ ] No credentials in comments
- [ ] All secrets use environment variables
- [ ] `.env.example` is up to date with placeholders

## 🔐 Local Development Setup

### Step 1: Copy Environment Template
```bash
cp .env.example .env.local
```

### Step 2: Fill in Real Values
Edit `.env.local` with your actual keys. This file is git-ignored.

### Step 3: Verify .gitignore
Ensure `.env.local` is in `.gitignore`:
```bash
git check-ignore .env.local
# Should output: .env.local
```

### Step 4: Test Secret Scanner
```bash
npm run public:scan
# Should output: ✅ PASS: No secrets found
```

## 🏗️ CI/CD Integration

### GitHub Actions (Recommended)

Add a secret scanning step to your workflow:

```yaml
- name: Scan for secrets
  run: npm run public:scan
```

### Pre-commit Hook (Optional)

Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
npm run public:scan
if [ $? -ne 0 ]; then
  echo "❌ Secret scan failed. Commit aborted."
  exit 1
fi
```

## 📁 Files That Should Never Be Committed

- `.env`
- `.env.local`
- `.env.production`
- `.env.development`
- `.env.*.local`
- `*.pem`
- `*.key`
- `*.p12`
- `**/secrets/**`
- `**/*credentials*.json`
- `**/*service-account*.json`

## ✅ Safe to Commit

- `.env.example` (with placeholders only)
- Documentation files
- Code that reads from `process.env.*`
- Placeholder values like `YOUR_KEY_HERE`, `pk_test_...`

## 🔄 Key Rotation Schedule

Even without exposure, rotate keys periodically:
- **API keys**: Every 90 days
- **Service role keys**: Every 180 days
- **Webhook secrets**: When webhook endpoints change

## 📚 Additional Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Last Security Scan:** Run `npm run public:scan` to verify current status.

**Status:** ✅ No secrets found in repository


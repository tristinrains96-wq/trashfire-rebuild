# TrashFire Setup — Quick Start

## 1. Paste Your Keys

Open **`PASTE_KEYS_HERE.env`** in the repo root and fill in:

- **Required (1-5)**: RunPod API key, SDXL endpoint, Wan Motion endpoint, Supabase URL, Supabase service role key
- **Required**: Supabase storage bucket name
- **Optional**: Groq API key (recommended for faster pipeline)

## 2. Apply Keys

**Windows (PowerShell):**
```powershell
.\scripts\apply_keys.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x scripts/apply_keys.sh
./scripts/apply_keys.sh
```

## 3. Restart App

Restart your backend and frontend to load the new keys.

---

**Note:** The script validates that all required keys (1-5) are filled before writing. If any are missing, it will show an error and exit.


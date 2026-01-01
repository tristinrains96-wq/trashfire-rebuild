#!/bin/bash
# TrashFire Key Apply Script (Bash)
# Reads PASTE_KEYS_HERE.env and writes to backend/.env and frontend .env.local

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_FILE="$REPO_ROOT/PASTE_KEYS_HERE.env"
BACKEND_ENV="$REPO_ROOT/backend/.env"
FRONTEND_ENV="$REPO_ROOT/.env.local"

echo "TrashFire Key Apply Script"
echo "========================="

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "ERROR: $SOURCE_FILE not found!" >&2
    echo "Please create PASTE_KEYS_HERE.env in the repo root and paste your keys." >&2
    exit 1
fi

echo "Reading keys from: $SOURCE_FILE"

# Parse env file and load into associative array (bash 4+)
declare -A env_vars

while IFS= read -r line || [ -n "$line" ]; do
    # Trim whitespace
    line=$(echo "$line" | xargs)
    
    # Skip empty lines, comments, section headers
    if [[ -z "$line" ]] || [[ "$line" =~ ^# ]] || [[ "$line" =~ ^= ]] || [[ "$line" =~ ^- ]]; then
        continue
    fi
    
    # Parse KEY=VALUE
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        # Trim key and value
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        env_vars["$key"]="$value"
    fi
done < "$SOURCE_FILE"

# Validate required keys (1-5)
required_keys=(
    "1_RUNPOD_API_KEY"
    "2_RUNPOD_SDXL_ENDPOINT_ID"
    "3_RUNPOD_WAN_MOTION_ENDPOINT_ID"
    "4_SUPABASE_URL"
    "5_SUPABASE_SERVICE_ROLE_KEY"
)

missing_keys=()
for key in "${required_keys[@]}"; do
    if [[ -z "${env_vars[$key]}" ]]; then
        missing_keys+=("$key")
    fi
done

if [ ${#missing_keys[@]} -gt 0 ]; then
    echo "ERROR: Missing required keys:" >&2
    for key in "${missing_keys[@]}"; do
        echo "  - $key" >&2
    done
    echo "" >&2
    echo "Please fill in all required keys (1-5) in PASTE_KEYS_HERE.env" >&2
    exit 1
fi

# Check SUPABASE_STORAGE_BUCKET
if [[ -z "${env_vars[SUPABASE_STORAGE_BUCKET]}" ]]; then
    echo "WARNING: SUPABASE_STORAGE_BUCKET is empty. Pipeline may not work." >&2
fi

echo "All required keys found. Applying..."

# Build backend .env content
backend_content="# TrashFire Backend Environment Variables
# Auto-generated from PASTE_KEYS_HERE.env
# DO NOT EDIT MANUALLY - run scripts/apply_keys.sh instead

"

# Backend keys (strip prefixes 1_, 2_, 3_, 4_, 5_)
# Note: SUPABASE_STORAGE_BUCKET maps to STORAGE_BUCKET in backend
backend_keys=(
    "RUNPOD_API_KEY"
    "RUNPOD_SDXL_ENDPOINT_ID"
    "RUNPOD_WAN_MOTION_ENDPOINT_ID"
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "STORAGE_BUCKET"
    "REDIS_URL"
    "GROQ_API_KEY"
    "GROQ_MODEL"
)

# Optional later keys (only if non-empty)
optional_keys=(
    "ELEVENLABS_API_KEY"
    "LEONARDO_API_KEY"
    "FAL_API_KEY"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "ANTHROPIC_API_KEY"
    "SENTRY_DSN"
)

for key in "${backend_keys[@]}"; do
    source_key="$key"
    # Map numbered keys
    case "$key" in
        "RUNPOD_API_KEY") source_key="1_RUNPOD_API_KEY" ;;
        "RUNPOD_SDXL_ENDPOINT_ID") source_key="2_RUNPOD_SDXL_ENDPOINT_ID" ;;
        "RUNPOD_WAN_MOTION_ENDPOINT_ID") source_key="3_RUNPOD_WAN_MOTION_ENDPOINT_ID" ;;
        "SUPABASE_URL") source_key="4_SUPABASE_URL" ;;
        "SUPABASE_SERVICE_ROLE_KEY") source_key="5_SUPABASE_SERVICE_ROLE_KEY" ;;
        "STORAGE_BUCKET") source_key="SUPABASE_STORAGE_BUCKET" ;;
    esac
    
    value="${env_vars[$source_key]}"
    
    # Use default for REDIS_URL if empty
    if [[ "$key" == "REDIS_URL" && -z "$value" ]]; then
        value="redis://redis:6379/0"
    fi
    
    backend_content+="$key=$value"$'\n'
done

# Add optional keys only if non-empty
for key in "${optional_keys[@]}"; do
    if [[ -n "${env_vars[$key]}" ]]; then
        backend_content+="$key=${env_vars[$key]}"$'\n'
    fi
done

# Write backend .env
mkdir -p "$(dirname "$BACKEND_ENV")"
echo -n "$backend_content" > "$BACKEND_ENV"
echo "✓ Written: $BACKEND_ENV"

# Build frontend .env.local content (only NEXT_PUBLIC_* keys)
frontend_content="# TrashFire Frontend Environment Variables
# Auto-generated from PASTE_KEYS_HERE.env
# DO NOT EDIT MANUALLY - run scripts/apply_keys.sh instead

"

frontend_keys=(
    "NEXT_PUBLIC_BACKEND_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "NEXT_PUBLIC_SETUP_ADMIN_EMAIL"
)

for key in "${frontend_keys[@]}"; do
    value="${env_vars[$key]}"
    
    # Use default for NEXT_PUBLIC_BACKEND_URL if empty
    if [[ "$key" == "NEXT_PUBLIC_BACKEND_URL" && -z "$value" ]]; then
        value="http://localhost:8000"
    fi
    
    frontend_content+="$key=$value"$'\n'
done

# Write frontend .env.local
echo -n "$frontend_content" > "$FRONTEND_ENV"
echo "✓ Written: $FRONTEND_ENV"

echo ""
echo "Done! Keys applied successfully."
echo "Restart your app to use the new keys."


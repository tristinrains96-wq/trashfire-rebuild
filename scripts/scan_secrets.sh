#!/bin/bash
# TrashFire Secret Scanner (Bash)
# Scans the repository for hardcoded secrets and API keys.
# Exits with non-zero code if secrets are found.

set -euo pipefail

FOUND_SECRETS=false
FINDINGS=()

# Patterns to search for (secret indicators)
declare -a PATTERNS=(
    "pk_test_[A-Za-z0-9_-]{40,}"
    "pk_live_[A-Za-z0-9_-]{40,}"
    "sk_test_[A-Za-z0-9_-]{40,}"
    "sk_live_[A-Za-z0-9_-]{40,}"
    "sb_secret_[A-Za-z0-9_-]{40,}"
    "eyJ[A-Za-z0-9_-]{100,}"
    "sk-[A-Za-z0-9_-]{40,}"
    "sk-ant-[A-Za-z0-9_-]{40,}"
    "service_role.*[A-Za-z0-9_-]{40,}"
    "whsec_[A-Za-z0-9_-]{40,}"
    "gsk_[A-Za-z0-9_-]{40,}"
)

# Pattern names
declare -a PATTERN_NAMES=(
    "Clerk Publishable Key (test)"
    "Clerk Publishable Key (live)"
    "Clerk Secret Key (test)"
    "Clerk Secret Key (live)"
    "Supabase Secret"
    "JWT Token (Supabase)"
    "API Key (sk-)"
    "API Key (sk-ant-)"
    "Service Role Key"
    "Stripe Webhook Secret"
    "Groq API Key"
)

# Directories to exclude
EXCLUDE_DIRS=("node_modules" ".next" ".git" "dist" "build" ".vercel" ".cursor" "tools")

# Files to exclude
EXCLUDE_FILES=(".env.local" ".env" "scan_secrets.sh" "public_secret_scan.ts" "scan_secrets.ts")

# Text file extensions to scan
TEXT_EXTENSIONS=("ts" "tsx" "js" "jsx" "json" "md" "txt" "yml" "yaml" "env" "example" "config" "log")

should_exclude_file() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    for exclude in "${EXCLUDE_FILES[@]}"; do
        if [[ "$file_name" == "$exclude" ]]; then
            return 0
        fi
    done
    
    if [[ "$file_name" == .env* ]]; then
        return 0
    fi
    
    return 1
}

should_exclude_dir() {
    local dir_name="$1"
    
    for exclude in "${EXCLUDE_DIRS[@]}"; do
        if [[ "$dir_name" == "$exclude" ]]; then
            return 0
        fi
    done
    
    return 1
}

scan_file() {
    local file_path="$1"
    
    if should_exclude_file "$file_path"; then
        return
    fi
    
    if [[ ! -r "$file_path" ]]; then
        return
    fi
    
    local line_num=0
    while IFS= read -r line || [[ -n "$line" ]]; do
        ((line_num++))
        
        for i in "${!PATTERNS[@]}"; do
            local pattern="${PATTERNS[$i]}"
            local pattern_name="${PATTERN_NAMES[$i]}"
            
            if echo "$line" | grep -qE "$pattern"; then
                local matches=$(echo "$line" | grep -oE "$pattern" || true)
                
                while IFS= read -r match; do
                    # Skip if it's clearly a placeholder or check
                    if [[ "$match" == *"..."* ]] || \
                       [[ "$match" == *"your_key"* ]] || \
                       [[ "$match" == *"YOUR_KEY"* ]] || \
                       [[ "$match" == *"pk_test_..."* ]] || \
                       [[ "$match" == *"placeholder"* ]] || \
                       [[ "$line" == *"!="* ]] || \
                       [[ "$line" == *"==="* ]] || \
                       [[ "$line" == *"check"* ]] || \
                       [[ "$line" == *"Check"* ]]; then
                        continue
                    fi
                    
                    # Real secret found
                    local preview="${match:0:20}..."
                    FINDINGS+=("$file_path:$line_num|$pattern_name|$preview")
                    FOUND_SECRETS=true
                done <<< "$matches"
            fi
        done
    done < "$file_path"
}

scan_directory() {
    local dir_path="$1"
    
    if [[ ! -d "$dir_path" ]] || [[ ! -r "$dir_path" ]]; then
        return
    fi
    
    while IFS= read -r -d '' entry; do
        if [[ -d "$entry" ]]; then
            local dir_name=$(basename "$entry")
            if ! should_exclude_dir "$dir_name"; then
                scan_directory "$entry"
            fi
        elif [[ -f "$entry" ]]; then
            local ext="${entry##*.}"
            local file_name=$(basename "$entry")
            
            local should_scan=false
            for text_ext in "${TEXT_EXTENSIONS[@]}"; do
                if [[ "$ext" == "$text_ext" ]] || [[ "$file_name" == .* ]]; then
                    should_scan=true
                    break
                fi
            done
            
            if [[ "$should_scan" == true ]]; then
                scan_file "$entry"
            fi
        fi
    done < <(find "$dir_path" -mindepth 1 -maxdepth 1 -print0 2>/dev/null || true)
}

# Main scan
REPO_ROOT=$(pwd)
echo "[Secret Scanner] Scanning repository: $REPO_ROOT"
echo ""

scan_directory "$REPO_ROOT"

if [[ "$FOUND_SECRETS" == false ]]; then
    echo "✅ PASS: No secrets found in repository"
    echo ""
    exit 0
else
    echo "❌ FAIL: Found potential secrets in tracked files:"
    echo ""
    
    for finding in "${FINDINGS[@]}"; do
        IFS='|' read -r file_info pattern_name preview <<< "$finding"
        echo "  $file_info"
        echo "    Pattern: $pattern_name"
        echo "    Preview: $preview"
        echo ""
    done
    
    echo "⚠️  Action required:"
    echo "  1. Remove all secrets from the files above"
    echo "  2. Ensure no API keys, tokens, or secrets are committed"
    echo "  3. This is a public repository - zero tolerance for secrets"
    echo ""
    exit 1
fi


# TrashFire Backend

FastAPI backend for TrashFire anime episode generation.

## Setup

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp ../env_templates/backend.env.example .env
# Edit .env with your credentials
```

3. **Database setup:**
```bash
# Run migration SQL
psql -d trashfire -f backend/db/migrations/001_create_jobs_table.sql

# Or manually create the table (see migration file)
```

4. **Run Redis:**
```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install locally
```

5. **Start Celery worker:**
```bash
# From project root, set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"  # Linux/Mac
# Or on Windows PowerShell:
# $env:PYTHONPATH = "$(Get-Location);$env:PYTHONPATH"

celery -A backend.celery_app worker --loglevel=info
```

6. **Start FastAPI server:**
```bash
# From project root, set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"  # Linux/Mac
# Or on Windows PowerShell:
# $env:PYTHONPATH = "$(Get-Location);$env:PYTHONPATH"

uvicorn backend.main:app --reload --port 8000
```

## RunPod Setup

1. Create a RunPod account at https://www.runpod.io
2. Create serverless endpoints via dashboard (queue-based serverless):
   - **SDXL Endpoint**: Use SDXL with anime checkpoint (e.g., animagine-xl)
   - **Wan Motion Endpoint**: Use Wan 2.2 TI2V-style model for motion generation
   - Copy the endpoint IDs
3. Get API key from user settings
4. Add credentials to `.env`:
   - `RUNPOD_API_KEY`
   - `RUNPOD_SDXL_ENDPOINT_ID`
   - `RUNPOD_WAN_MOTION_ENDPOINT_ID`

## Cloudflare R2 Setup

1. Create R2 bucket in Cloudflare dashboard
2. Create API token with R2 read/write permissions
3. Add credentials to `.env`

## API Endpoints

### Keyframe Generation (Phase 1)
- `POST /api/v1/generation/generate_keyframes` - Enqueue SDXL keyframe generation
- `GET /api/v1/generation/jobs/{job_id}` - Get job status and results

### Animatic Composition (Phase 2)
- `POST /api/v1/generation/generate_animatic` - Enqueue animatic video composition from keyframes

### Voiced Animatic (Phase 3)
- `POST /api/v1/generation/generate_voiced_animatic` - Enqueue voiced animatic with TTS and lip-sync

### Motion Clips (Phase Motion-1)
- `POST /api/v1/generation/generate_motion_clip` - Enqueue motion video clip generation from keyframe

### Episode Stitching (Phase Episode-1)
- `POST /api/v1/generation/stitch_episode` - Enqueue episode stitching from animatic and motion segments

### Generate Episode Free (Phase Episode-2)
- `POST /api/v1/generation/generate_episode_free` - One-button episode generation (full pipeline)

See `/docs` for interactive API documentation.

## System Dependencies

### FFmpeg (Required for Phase 2+)

FFmpeg is required for animatic composition and audio mixing. Install FFmpeg on your system:

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

The service will auto-detect FFmpeg in PATH. You can also specify a custom path via environment variable.

### Piper TTS (Required for Phase 3)

Piper TTS is required for free text-to-speech generation. Install Piper:

**Download:**
- Get Piper from: https://github.com/rhasspy/piper/releases
- Or install via package manager if available

**Voice Models:**
- Download voice models from: https://huggingface.co/rhasspy/piper-voices
- Recommended: `en_US-lessac-medium` (English, medium quality)
- Place models in `~/.local/share/piper/voices/` or specify path

**Example:**
```bash
# Download model
mkdir -p ~/.local/share/piper/voices/en_US-lessac-medium
cd ~/.local/share/piper/voices/en_US-lessac-medium
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json
```

### Rhubarb Lip-Sync (Optional for Phase 3)

Rhubarb is optional for lip-sync mouth shape generation. Install Rhubarb:

**Download:**
- Get Rhubarb from: https://github.com/DanielSWolf/rhubarb-lip-sync/releases
- Extract and add to PATH

**Note:** Full lip-sync requires mouth shape sprite assets (not included).

## Architecture

- **FastAPI**: REST API server
- **Celery**: Background task processing
- **RunPod**: Serverless GPU for SDXL keyframes (Phase 1) and motion clips (Phase Motion-1)
- **FFmpeg**: Local video composition and audio mixing (Phase 2-3)
- **Piper TTS**: Free, local text-to-speech (Phase 3)
- **Rhubarb**: Free lip-sync mouth shape generation (Phase 3, optional)
- **Cloudflare R2 / Supabase Storage**: Persistent storage for keyframes, audio, and videos
- **PostgreSQL**: Job tracking and metadata

## Open Motion Clips (RunPod Wan 2.2 TI2V)

Generate true motion video clips (5-10 seconds) from keyframes using open models on RunPod.

### Setup

1. **Create RunPod Wan Motion Endpoint:**
   - Go to RunPod dashboard
   - Create new serverless endpoint (queue-based)
   - Use Wan 2.2 TI2V-style template/model
   - Copy the endpoint ID

2. **Configure Environment:**
   - Add `RUNPOD_WAN_MOTION_ENDPOINT_ID` to `.env`
   - Ensure `RUNPOD_API_KEY` is set

3. **Storage Configuration:**
   - Set `STORAGE_PROVIDER` (r2 or supabase)
   - Configure storage credentials
   - Clips are stored under: `episodes/{episode_id}/scenes/{scene_id}/motion/{uuid}.mp4`

### Usage

**Clip Duration Limits:**
- Minimum: 5 seconds (cost control)
- Maximum: 10 seconds (cost control)
- Default: 6 seconds

**Output:**
- Clips are automatically uploaded to your configured storage
- Storage URLs never expire (unlike provider URLs)
- Format: MP4, configurable resolution (default 1280x720)

**Example Request:**
```json
POST /api/v1/generation/generate_motion_clip
{
  "episode_id": "ep-123",
  "scene_id": "sc-001",
  "keyframe_url": "https://r2.../keyframe.png",
  "prompt": "character draws sword, dramatic wind, anime lighting",
  "seconds": 6,
  "fps": 24,
  "width": 1280,
  "height": 720
}
```

**Response:**
```json
{
  "job_id": "job-uuid",
  "mode": "runpod_wan_motion",
  "status": "pending",
  "message": "Motion clip generation job enqueued..."
}
```

**Poll Status:**
```json
GET /api/v1/generation/jobs/{job_id}
{
  "status": "completed",
  "result_urls": ["https://storage.../motion/clip.mp4"]
}
```

## Episode Stitching (Animatic + Wan Motion)

Stitch together animatic and motion clips into full episode videos with consistent resolution, fps, and codecs.

### Overview

The episode stitcher takes an ordered list of segment URLs (animatic MP4s from Phase 2, or motion clips from Phase Motion-1) and produces a single, cohesive episode video.

**Key Features:**
- **Normalization**: Every segment is normalized to target resolution, fps, and codec before concatenation
- **Consistent Output**: All segments maintain aspect ratio (no stretching), padded to target resolution
- **Audio Handling**: Silent audio tracks added if missing (ensures stable concatenation)
- **Transitions**: Hard cuts (default) or crossfades (optional)
- **Storage**: Final episode stored permanently in your storage

### Usage

**Input Segments:**
- **Animatic segments**: MP4s from Phase 2 compositor
- **Motion segments**: MP4s from Phase Motion-1 Wan motion clips
- Segments are processed in order

**Example Request:**
```json
POST /api/v1/generation/stitch_episode
{
  "episode_id": "ep-123",
  "segments": [
    {
      "scene_id": "sc-001",
      "type": "animatic",
      "url": "https://storage.../animatic_sc001.mp4"
    },
    {
      "scene_id": "sc-002",
      "type": "motion",
      "url": "https://storage.../motion_sc002.mp4"
    },
    {
      "scene_id": "sc-003",
      "type": "animatic",
      "url": "https://storage.../animatic_sc003.mp4"
    }
  ],
  "fps": 24,
  "width": 1280,
  "height": 720,
  "transition": "cut",
  "fade_ms": 250
}
```

**Response:**
```json
{
  "job_id": "job-uuid",
  "mode": "episode_stitch",
  "status": "pending",
  "message": "Episode stitching job enqueued. Processing 3 segments (2 animatic, 1 motion) with cut transitions."
}
```

**Poll Status:**
```json
GET /api/v1/generation/jobs/{job_id}
{
  "status": "completed",
  "result_urls": ["https://storage.../episodes/ep-123/exports/episode_24fps_1280x720.mp4"]
}
```

### Normalization Process

Each segment is normalized before concatenation:
1. **Download** segment from URL
2. **Scale + Pad** to target resolution (maintains aspect ratio, no stretching)
3. **Force FPS** to target fps
4. **Ensure Codecs**: h264 video, aac audio
5. **Add Silent Audio** if segment has no audio track

This ensures all segments are compatible for concatenation without codec/fps/resolution mismatches.

### Transitions

- **`cut`** (default): Hard cuts between segments (fastest, most stable)
- **`fade`**: Crossfade transitions (optional, can be enhanced in future versions)

### Output

- **Storage Path**: `episodes/{episode_id}/exports/episode_{fps}fps_{width}x{height}.mp4`
- **Format**: MP4, h264 video, aac audio
- **Resolution**: As specified (default 1280x720)
- **FPS**: As specified (default 24)
- **Permanent**: Stored in your configured storage (never expires)

## Generate Episode Free (One Button)

Automated episode generation pipeline that handles the entire workflow from scene prompts to final episode video.

### Overview

The "Generate Episode Free" endpoint automates the complete episode generation process:
1. **Manifest Building**: Creates episode manifest with automatic motion selection
2. **Keyframe Generation**: Generates SDXL keyframes for all scenes (parallel)
3. **Animatic Generation**: Composes animatic videos for all scenes (parallel)
4. **Motion Clips**: Generates Wan motion clips for selected scenes (parallel)
5. **Episode Stitching**: Combines all segments into final episode
6. **Voice Track**: Adds TTS voice if dialogue provided (optional)

### Quality Presets

- **`draft`**: 720p, 24fps, 0-10% motion scenes, 8 keyframes/scene
- **`standard`**: 720p, 24fps, 10-20% motion scenes, 12 keyframes/scene
- **`ultra_free`**: 1080p, 24fps, up to 30% motion scenes, 16 keyframes/scene

### Automatic Motion Selection

Motion clips are automatically selected for scenes with:
- **Hero flag**: User marks scene as `"hero": true`
- **Action keywords**: Prompt contains motion keywords (fight, run, jump, explosion, chase, transform, impact, etc.)

Motion percentage is capped by preset to control costs.

### Safety Caps

- **Max scenes**: 30 per request
- **Max duration**: 15 minutes total
- **Motion percentage**: Capped by preset (10/20/30%)
- **Motion clip duration**: Capped at 10 seconds per scene

### Usage

**Example Request:**
```json
POST /api/v1/generation/generate_episode_free
{
  "episode_id": "ep-123",
  "quality_preset": "standard",
  "scenes": [
    {
      "scene_id": "sc-001",
      "prompt": "Character walks through forest, peaceful morning light",
      "dialogue": "I wonder what lies ahead...",
      "hero": false,
      "duration_seconds": 20
    },
    {
      "scene_id": "sc-002",
      "prompt": "Character draws sword, dramatic wind, epic battle begins",
      "dialogue": "This ends now!",
      "hero": true,
      "duration_seconds": 10
    },
    {
      "scene_id": "sc-003",
      "prompt": "Character stands victorious, sunset in background",
      "dialogue": null,
      "hero": false,
      "duration_seconds": 15
    }
  ],
  "transition": "cut",
  "voice": true
}
```

**Response:**
```json
{
  "job_id": "job-uuid",
  "mode": "episode_pipeline_free",
  "status": "pending",
  "message": "Episode generation pipeline enqueued. 3 scenes (2 animatic, 1 motion), 45s total, preset=standard."
}
```

**Poll Status:**
```json
GET /api/v1/generation/jobs/{job_id}
{
  "status": "completed",
  "result_urls": ["https://storage.../episodes/ep-123/exports/episode_24fps_1280x720.mp4"]
}
```

### Manifest

The system builds an episode manifest that tracks:
- Scene specifications (prompts, durations, motion modes)
- Generated outputs (keyframe URLs, animatic URLs, motion URLs)
- Quality settings (resolution, fps, preset)

Manifest is stored in the job record for reference.

### Pipeline Stages

1. **Keyframes** (Parallel): All scenes generate keyframes simultaneously
2. **Animatics** (Parallel): All scenes compose animatics from keyframes
3. **Motion** (Parallel): Selected scenes generate motion clips
4. **Stitching**: All segments combined into episode
5. **Voice** (Optional): TTS added if dialogue provided

Each stage updates the manifest with outputs, which are used by subsequent stages.

### Cost Control

- Motion scenes are expensive (RunPod GPU time)
- Presets limit motion percentage automatically
- Hard caps prevent runaway costs
- Early validation fails fast on invalid requests

## Workflow

1. **Phase 1 - Keyframe Generation:**
   - Submit prompts via `/generate_keyframes`
   - RunPod generates SDXL anime keyframes
   - Keyframes uploaded to R2 storage
   - Job returns list of keyframe URLs

2. **Phase 2 - Animatic Composition:**
   - Submit keyframe URLs and durations via `/generate_animatic`
   - FFmpeg composes animatic video with effects
   - Final MP4 uploaded to R2 storage
   - Job returns video URL

3. **Phase 3 - Voiced Animatic:**
   - Submit dialogue text and animatic video URL via `/generate_voiced_animatic`
   - Piper TTS generates audio for each dialogue line
   - Optional: Rhubarb generates lip-sync mouth shapes
   - FFmpeg mixes audio into animatic video
   - Final voiced MP4 uploaded to R2 storage
   - Job returns final video URL

4. **Phase Motion-1 - Open Motion Clips:**
   - Submit keyframe URL and motion prompt via `/generate_motion_clip`
   - RunPod Wan motion endpoint generates 5-10s video clip
   - Clip uploaded to storage (never expires like provider URLs)
   - Job returns stored clip URL

5. **Phase Episode-1 - Episode Stitching:**
   - Submit ordered list of segment URLs via `/stitch_episode`
   - Segments normalized (resolution, fps, codec)
   - Segments concatenated with transitions
   - Final episode video uploaded to storage
   - Job returns stored episode URL

6. **Phase Episode-2 - Generate Episode Free (One Button):**
   - Submit scene list with prompts via `/generate_episode_free`
   - System builds manifest with automatic motion selection
   - Generates keyframes → animatics → motion clips (if needed) → stitches → voices (if dialogue)
   - Complete episode video uploaded to storage
   - Job returns final episode URL


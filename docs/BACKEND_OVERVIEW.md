# TrashFire Backend Overview

Architecture and implementation guide for the TrashFire backend (planned for v1.0).

## 🏗️ Planned Architecture

### Tech Stack (Target)

- **API Framework:** FastAPI (Python)
- **Task Queue:** Celery + Redis
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage / S3
- **Authentication:** Clerk (JWT validation)
- **Billing:** Stripe (webhooks)

### Current State

**Status:** Backend not yet implemented. All generation logic is stubbed.

**Stubs Present:**
- `lib/video_engine.ts` - Video generation stub
- `lib/audio_engine.ts` - Audio generation stub
- `lib/render_engine.ts` - Render pipeline stub
- `lib/pod-manager.ts` - Pod management stub
- `lib/supabase.ts` - Supabase client stub
- `lib/utils.ts` - Groq LLM stub

## 📁 Planned Backend Structure

```
backend/                    # FastAPI Backend (to be created)
├── main.py                # FastAPI app entrypoint
├── config.py              # Configuration
├── dependencies.py        # FastAPI dependencies
│
├── api/                   # API Routes
│   ├── __init__.py
│   ├── episodes.py        # Episode CRUD
│   ├── script.py          # Script generation
│   ├── characters.py      # Character management
│   ├── scenes.py          # Scene generation
│   ├── render.py          # Video rendering
│   ├── guardrails.py      # Guardrails check
│   └── billing.py         # Stripe webhooks
│
├── services/              # Business Logic
│   ├── __init__.py
│   ├── llm_service.py     # Groq LLM integration
│   ├── video_service.py   # SVD video generation
│   ├── audio_service.py   # ElevenLabs integration
│   ├── render_service.py  # Render orchestration
│   └── pod_service.py     # RunPod/Vast.ai management
│
├── models/                # Database Models
│   ├── __init__.py
│   ├── episode.py
│   ├── character.py
│   ├── scene.py
│   └── user.py
│
├── schemas/               # Pydantic Schemas
│   ├── __init__.py
│   ├── episode.py
│   ├── script.py
│   └── render.py
│
├── tasks/                 # Celery Tasks
│   ├── __init__.py
│   ├── render_tasks.py    # Video rendering tasks
│   ├── script_tasks.py    # Script generation tasks
│   └── cleanup_tasks.py    # Cleanup tasks
│
├── db/                    # Database
│   ├── __init__.py
│   ├── session.py         # DB session
│   └── migrations/        # Alembic migrations
│
└── utils/                 # Utilities
    ├── __init__.py
    ├── auth.py            # Clerk JWT validation
    ├── guardrails.py      # Guardrails logic
    └── storage.py         # File storage
```

## 🔌 FastAPI Structure

### Entry Point (`backend/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import episodes, script, render, billing

app = FastAPI(title="TrashFire API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(episodes.router, prefix="/api/episodes", tags=["episodes"])
app.include_router(script.router, prefix="/api/script", tags=["script"])
app.include_router(render.router, prefix="/api/render", tags=["render"])
app.include_router(billing.router, prefix="/api/billing", tags=["billing"])
```

### Authentication (`backend/utils/auth.py`)

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
import jwt
from clerk_sdk import Clerk

security = HTTPBearer()
clerk = Clerk(api_key=os.getenv("CLERK_SECRET_KEY"))

async def verify_token(token: str = Depends(security)):
    try:
        # Verify Clerk JWT
        payload = clerk.verify_token(token.credentials)
        return payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
```

### Example Route (`backend/api/episodes.py`)

```python
from fastapi import APIRouter, Depends
from schemas.episode import EpisodeCreate, EpisodeResponse
from services.llm_service import LLMService
from utils.auth import verify_token

router = APIRouter()

@router.post("/", response_model=EpisodeResponse)
async def create_episode(
    episode: EpisodeCreate,
    user: dict = Depends(verify_token)
):
    # Create episode
    # ...
    return episode_response
```

## 🗄️ Database Layer

### Supabase Integration

**Current:** Stub in `lib/supabase.ts`

**Planned:**
- Use Supabase Python client
- Direct PostgreSQL connection for complex queries
- Supabase Storage for file uploads

### Database Schema (Planned)

```sql
-- Users (managed by Clerk, synced to Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  clerk_id TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMP
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP
);

-- Episodes
CREATE TABLE episodes (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  episode_number INTEGER,
  script TEXT,
  status TEXT,
  created_at TIMESTAMP
);

-- Characters
CREATE TABLE characters (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT,
  dna JSONB,
  created_at TIMESTAMP
);

-- Scenes
CREATE TABLE scenes (
  id UUID PRIMARY KEY,
  episode_id UUID REFERENCES episodes(id),
  scene_number INTEGER,
  script TEXT,
  video_url TEXT,
  created_at TIMESTAMP
);
```

## 🔄 Celery Task Queue

### Setup

```python
# backend/celery_app.py
from celery import Celery

celery_app = Celery(
    "trashfire",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)
```

### Example Task (`backend/tasks/render_tasks.py`)

```python
from celery_app import celery_app
from services.render_service import RenderService

@celery_app.task
def render_episode(episode_id: str):
    """Render episode video"""
    render_service = RenderService()
    result = render_service.render(episode_id)
    return result
```

### Task Types

1. **Script Generation** (`tasks/script_tasks.py`)
   - Generate script from prompt
   - Analyze script for entities
   - Generate outline

2. **Video Rendering** (`tasks/render_tasks.py`)
   - Spin up RunPod/Vast.ai pod
   - Generate video with SVD
   - Upload to storage

3. **Audio Generation** (`tasks/audio_tasks.py`)
   - Generate voice with ElevenLabs
   - Sync with video

4. **Cleanup** (`tasks/cleanup_tasks.py`)
   - Clean up pods
   - Delete temporary files

## 🤖 Generation Services

### LLM Service (`services/llm_service.py`)

**Provider:** Groq (Llama 3.1 8B)

```python
import groq

class LLMService:
    def __init__(self):
        self.client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    async def generate_script(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
```

### Video Service (`services/video_service.py`)

**Provider:** RunPod/Vast.ai (RTX 4090) + SVD

```python
class VideoService:
    async def generate_video(
        self,
        prompt: str,
        image: bytes,
        style: str
    ) -> str:
        # 1. Spin up pod
        pod_id = await self.pod_service.spin_pod()
        
        # 2. Upload image to pod
        await self.pod_service.upload_to_pod(pod_id, image)
        
        # 3. Run SVD generation
        video_url = await self.pod_service.run_svd(pod_id, prompt)
        
        # 4. Download video
        video_bytes = await self.download_video(video_url)
        
        # 5. Upload to storage
        storage_url = await self.upload_to_storage(video_bytes)
        
        # 6. Clean up pod
        await self.pod_service.cleanup_pod(pod_id)
        
        return storage_url
```

### Audio Service (`services/audio_service.py`)

**Provider:** ElevenLabs Turbo

```python
from elevenlabs import generate, play

class AudioService:
    async def generate_voice(
        self,
        text: str,
        voice_id: str,
        model: str = "eleven_turbo_v2"
    ) -> bytes:
        audio = generate(
            text=text,
            voice=voice_id,
            model=model,
            api_key=os.getenv("ELEVENLABS_API_KEY")
        )
        return audio
```

### Pod Service (`services/pod_service.py`)

**Providers:** RunPod, Vast.ai

```python
class PodService:
    async def spin_pod(self, provider: str = "runpod") -> str:
        if provider == "runpod":
            return await self._spin_runpod()
        elif provider == "vast":
            return await self._spin_vast()
    
    async def _spin_runpod(self) -> str:
        # RunPod GraphQL API
        # ...
    
    async def _spin_vast(self) -> str:
        # Vast.ai API
        # ...
```

## 🔒 Guardrails

### Guardrails Service (`services/guardrails_service.py`)

```python
class GuardrailsService:
    def check_generation_allowed(
        self,
        user_id: str,
        request_type: str
    ) -> dict:
        # Check allowlist
        # Check rate limits
        # Check spending caps
        # ...
        return {
            "allowed": True,
            "reason": None
        }
```

### Rate Limiting

- Per-user daily limits
- Global daily limits
- Spending caps

## 💳 Billing Integration

### Stripe Webhook (`backend/api/billing.py`)

```python
from fastapi import APIRouter, Request
import stripe

router = APIRouter()

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    event = stripe.Webhook.construct_event(
        payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
    )
    
    if event.type == "customer.subscription.created":
        # Update user subscription
        pass
    
    return {"status": "success"}
```

## 🚀 Running Locally

### Prerequisites

- Python 3.11+
- Redis (for Celery)
- PostgreSQL (or Supabase)

### Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your keys

# Run migrations
alembic upgrade head

# Start FastAPI
uvicorn main:app --reload --port 8000

# Start Celery worker (separate terminal)
celery -A celery_app worker --loglevel=info
```

### Docker Compose (Planned)

```yaml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - redis
      - db
  
  worker:
    build: ./backend
    command: celery -A celery_app worker
    depends_on:
      - redis
      - db
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=trashfire
      - POSTGRES_USER=trashfire
      - POSTGRES_PASSWORD=trashfire
```

## 📡 API Endpoints (Planned)

### Episodes

- `GET /api/episodes` - List episodes
- `POST /api/episodes` - Create episode
- `GET /api/episodes/{id}` - Get episode
- `PATCH /api/episodes/{id}` - Update episode
- `DELETE /api/episodes/{id}` - Delete episode

### Script

- `POST /api/script/generate` - Generate script
- `POST /api/script/analyze` - Analyze script
- `POST /api/script/expand` - Expand scene

### Render

- `POST /api/render/episode/{id}` - Render episode
- `GET /api/render/status/{job_id}` - Get render status

### Guardrails

- `GET /api/guardrails/check` - Check if generation allowed

### Billing

- `POST /api/billing/checkout` - Create checkout session
- `POST /api/billing/portal` - Create portal session
- `POST /api/billing/webhook` - Stripe webhook

## 🔗 Frontend Integration

### Next.js API Routes (Proxy)

```typescript
// app/api/episodes/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  const response = await fetch('http://localhost:8000/api/episodes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return response
}
```

## 📊 Current Implementation Status

### ✅ Stubs Created
- Video engine stub (`lib/video_engine.ts`)
- Audio engine stub (`lib/audio_engine.ts`)
- Render engine stub (`lib/render_engine.ts`)
- Pod manager stub (`lib/pod-manager.ts`)
- Supabase client stub (`lib/supabase.ts`)
- Groq LLM stub (`lib/utils.ts`)

### 🚧 To Be Implemented
- FastAPI server structure
- Database models and migrations
- Celery task queue
- Generation service implementations
- API route handlers
- Webhook handlers
- Authentication middleware

## 🎯 Implementation Roadmap

### Week 1: Groq + SVD Stubs
- [ ] Set up FastAPI server
- [ ] Implement Groq LLM service
- [ ] Create SVD video generation stub
- [ ] Basic API routes

### Week 2: Audio + Render + Billing
- [ ] ElevenLabs integration
- [ ] Render pipeline
- [ ] Stripe webhook handlers
- [ ] Celery task queue

### Week 3: Polish + Launch
- [ ] Database migrations
- [ ] Error handling
- [ ] Rate limiting
- [ ] Documentation

---

**Last Updated:** Backend overview for TrashFire v1.0
**Status:** Backend not yet implemented, stubs ready


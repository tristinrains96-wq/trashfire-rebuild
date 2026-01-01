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
2. Create a serverless endpoint via dashboard:
   - Template: Use SDXL with anime checkpoint (e.g., animagine-xl)
   - Type: Queue-based serverless
   - Copy the endpoint ID
3. Get API key from user settings
4. Add credentials to `.env`

## Cloudflare R2 Setup

1. Create R2 bucket in Cloudflare dashboard
2. Create API token with R2 read/write permissions
3. Add credentials to `.env`

## API Endpoints

- `POST /api/v1/generation/generate_keyframes` - Enqueue keyframe generation
- `GET /api/v1/generation/jobs/{job_id}` - Get job status

See `/docs` for interactive API documentation.

## Architecture

- **FastAPI**: REST API server
- **Celery**: Background task processing
- **RunPod**: Serverless GPU for SDXL generation
- **Cloudflare R2**: Persistent storage for generated keyframes
- **PostgreSQL**: Job tracking and metadata


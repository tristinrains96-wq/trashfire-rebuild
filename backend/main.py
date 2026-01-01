"""
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.api.v1.endpoints import generation

app = FastAPI(
    title="TrashFire API",
    version="1.0.0",
    description="Backend API for TrashFire anime episode generation"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    generation.router,
    prefix=f"{settings.API_V1_PREFIX}/generation",
    tags=["generation"]
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "trashfire-api"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "TrashFire API",
        "version": "1.0.0",
        "docs": "/docs"
    }


"""
Configuration for TrashFire backend
"""
import os
from typing import Optional

class Settings:
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/trashfire")
    
    # Redis (for Celery)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # RunPod
    RUNPOD_API_KEY: Optional[str] = os.getenv("RUNPOD_API_KEY")
    RUNPOD_SDXL_ENDPOINT_ID: Optional[str] = os.getenv("RUNPOD_SDXL_ENDPOINT_ID")
    
    # Cloudflare R2
    R2_ACCOUNT_ID: Optional[str] = os.getenv("R2_ACCOUNT_ID")
    R2_ACCESS_KEY_ID: Optional[str] = os.getenv("R2_ACCESS_KEY_ID")
    R2_SECRET_ACCESS_KEY: Optional[str] = os.getenv("R2_SECRET_ACCESS_KEY")
    R2_BUCKET_NAME: str = os.getenv("R2_BUCKET_NAME", "trashfire-keyframes")
    R2_ENDPOINT_URL: Optional[str] = os.getenv("R2_ENDPOINT_URL")
    
    # Clerk Auth
    CLERK_SECRET_KEY: Optional[str] = os.getenv("CLERK_SECRET_KEY")
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    class Config:
        case_sensitive = True

settings = Settings()


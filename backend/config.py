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
    RUNPOD_WAN_MOTION_ENDPOINT_ID: Optional[str] = os.getenv("RUNPOD_WAN_MOTION_ENDPOINT_ID")
    
    # Storage (R2 or Supabase)
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "r2")  # r2 or supabase
    STORAGE_BUCKET: Optional[str] = os.getenv("STORAGE_BUCKET")
    STORAGE_REGION: Optional[str] = os.getenv("STORAGE_REGION")
    STORAGE_ACCESS_KEY: Optional[str] = os.getenv("STORAGE_ACCESS_KEY")
    STORAGE_SECRET_KEY: Optional[str] = os.getenv("STORAGE_SECRET_KEY")
    STORAGE_ENDPOINT_URL: Optional[str] = os.getenv("STORAGE_ENDPOINT_URL")
    
    # Cloudflare R2 (legacy, for backward compatibility)
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


"""
Database models for job tracking
Dual tracking: Celery task ID + RunPod job ID
"""
from sqlalchemy import Column, String, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
import enum

Base = declarative_base()


class JobStatus(str, enum.Enum):
    """Job status enum"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Job(Base):
    """
    Job tracking table
    Tracks both Celery task ID and RunPod job ID for dual monitoring
    """
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True)  # UUID
    celery_task_id = Column(String, nullable=True, index=True)  # Celery task ID
    runpod_job_id = Column(String, nullable=True, index=True)  # RunPod job ID
    status = Column(SQLEnum(JobStatus), default=JobStatus.PENDING, nullable=False, index=True)
    result_urls = Column(JSON, nullable=True)  # List of R2 URLs for generated keyframes
    error_message = Column(String, nullable=True)  # Error message if failed
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "celery_task_id": self.celery_task_id,
            "runpod_job_id": self.runpod_job_id,
            "status": self.status.value,
            "result_urls": self.result_urls,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


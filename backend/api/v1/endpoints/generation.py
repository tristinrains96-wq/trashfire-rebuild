"""
FastAPI endpoints for keyframe generation
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.models.jobs import Job, JobStatus
from backend.tasks.generation_tasks import generate_sdxl_keyframes

router = APIRouter()


class KeyframeGenerationRequest(BaseModel):
    """Request body for keyframe generation"""
    episode_id: str = Field(..., description="Episode ID")
    scene_id: str = Field(..., description="Scene ID")
    prompts: List[str] = Field(..., min_items=1, description="List of prompts for keyframe generation")
    batch_size: int = Field(default=10, ge=1, le=20, description="Number of prompts per batch")


class KeyframeGenerationResponse(BaseModel):
    """Response for keyframe generation request"""
    job_id: str = Field(..., description="Celery job ID")
    status: str = Field(..., description="Job status")
    message: str = Field(..., description="Status message")


class JobStatusResponse(BaseModel):
    """Response for job status query"""
    job_id: str
    celery_task_id: Optional[str]
    runpod_job_id: Optional[str]
    status: str
    result_urls: Optional[List[str]]
    error_message: Optional[str]
    created_at: str
    updated_at: Optional[str]


@router.post("/generate_keyframes", response_model=KeyframeGenerationResponse)
async def generate_keyframes(
    request: KeyframeGenerationRequest,
    db: Session = Depends(get_db)
):
    """
    Enqueue keyframe generation job
    
    Creates a new job record and enqueues Celery task for SDXL keyframe generation.
    """
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job record
    job = Job(
        id=job_id,
        status=JobStatus.PENDING
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Enqueue Celery task
    try:
        task = generate_sdxl_keyframes.delay(
            scene_id=request.scene_id,
            prompts=request.prompts,
            batch_size=request.batch_size,
            job_id=job_id
        )
        
        # Update job with Celery task ID
        job.celery_task_id = task.id
        db.commit()
        
        return KeyframeGenerationResponse(
            job_id=job_id,
            status="pending",
            message=f"Keyframe generation job enqueued. Processing {len(request.prompts)} prompts in batches of {request.batch_size}."
        )
        
    except Exception as e:
        # Mark job as failed
        job.status = JobStatus.FAILED
        job.error_message = str(e)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enqueue job: {str(e)}"
        )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Get job status and results
    
    Returns current status, RunPod job ID, and result URLs if completed.
    Optionally polls RunPod if job is still in progress.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found"
        )
    
    # If job is still running and has RunPod job ID, optionally poll RunPod
    # (For now, we rely on Celery task to update the DB)
    
    return JobStatusResponse(
        job_id=job.id,
        celery_task_id=job.celery_task_id,
        runpod_job_id=job.runpod_job_id,
        status=job.status.value,
        result_urls=job.result_urls,
        error_message=job.error_message,
        created_at=job.created_at.isoformat() if job.created_at else "",
        updated_at=job.updated_at.isoformat() if job.updated_at else None
    )


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
from backend.tasks.generation_tasks import generate_sdxl_keyframes, compose_episode, voice_and_sync_episode

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


class SceneData(BaseModel):
    """Scene data for animatic composition"""
    keyframe_urls: List[str] = Field(..., min_items=1, description="List of keyframe URLs from Phase 1")
    durations: List[float] = Field(..., min_items=1, description="List of durations in seconds for each keyframe")
    effects: Optional[Dict[str, Any]] = Field(default=None, description="Optional effects (zoompan, colorgrade, etc.)")


class AnimaticGenerationRequest(BaseModel):
    """Request body for animatic generation"""
    episode_id: str = Field(..., description="Episode ID")
    scene_data: List[SceneData] = Field(..., min_items=1, description="List of scene data with keyframes and durations")


class AnimaticGenerationResponse(BaseModel):
    """Response for animatic generation request"""
    job_id: str = Field(..., description="Job ID")
    status: str = Field(..., description="Job status")
    message: str = Field(..., description="Status message")


class VoicedAnimaticGenerationRequest(BaseModel):
    """Request body for voiced animatic generation"""
    episode_id: str = Field(..., description="Episode ID")
    dialogue_text: List[str] = Field(..., min_items=1, description="List of dialogue lines to voice")
    animatic_video_url: str = Field(..., description="URL to Phase 2 animatic video")
    keyframes_urls: List[str] = Field(..., min_items=1, description="List of keyframe URLs for lip-sync")


class VoicedAnimaticGenerationResponse(BaseModel):
    """Response for voiced animatic generation request"""
    job_id: str = Field(..., description="Job ID")
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


@router.post("/generate_animatic", response_model=AnimaticGenerationResponse)
async def generate_animatic(
    request: AnimaticGenerationRequest,
    db: Session = Depends(get_db)
):
    """
    Enqueue animatic composition job
    
    Composes animatic-style episode video from Phase 1 keyframes using FFmpeg.
    Creates a new job record and enqueues Celery task for video composition.
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
    
    # Prepare scene data for Celery task
    scene_data_list = []
    for scene in request.scene_data:
        scene_data_list.append({
            "keyframe_urls": scene.keyframe_urls,
            "durations": scene.durations,
            "effects": scene.effects or {}
        })
    
    # Enqueue Celery task
    try:
        task = compose_episode.delay(
            episode_id=request.episode_id,
            scene_data=scene_data_list,
            job_id=job_id
        )
        
        # Update job with Celery task ID
        job.celery_task_id = task.id
        db.commit()
        
        total_keyframes = sum(len(scene.keyframe_urls) for scene in request.scene_data)
        total_duration = sum(sum(scene.durations) for scene in request.scene_data)
        
        return AnimaticGenerationResponse(
            job_id=job_id,
            status="pending",
            message=f"Animatic composition job enqueued. Processing {len(request.scene_data)} scenes with {total_keyframes} keyframes ({total_duration:.1f}s total)."
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


@router.post("/generate_voiced_animatic", response_model=VoicedAnimaticGenerationResponse)
async def generate_voiced_animatic(
    request: VoicedAnimaticGenerationRequest,
    db: Session = Depends(get_db)
):
    """
    Enqueue voiced animatic composition job
    
    Generates TTS audio using Piper, optionally syncs with Rhubarb lip-sync,
    and mixes audio into Phase 2 animatic video using FFmpeg.
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
        task = voice_and_sync_episode.delay(
            episode_id=request.episode_id,
            dialogue_text=request.dialogue_text,
            animatic_video_url=request.animatic_video_url,
            keyframes_urls=request.keyframes_urls,
            job_id=job_id
        )
        
        # Update job with Celery task ID
        job.celery_task_id = task.id
        db.commit()
        
        return VoicedAnimaticGenerationResponse(
            job_id=job_id,
            status="pending",
            message=f"Voiced animatic composition job enqueued. Processing {len(request.dialogue_text)} dialogue lines with TTS and lip-sync."
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
    For keyframe generation jobs: returns list of keyframe URLs.
    For animatic composition jobs: returns list with single video URL.
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


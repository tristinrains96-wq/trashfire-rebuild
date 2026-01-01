"""
Celery tasks for SDXL keyframe generation
"""
import os
import uuid
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.celery_app import celery_app
from backend.services.runpod_service import RunPodService
from backend.utils.storage import R2Storage
from backend.models.jobs import Job, JobStatus
from backend.db.session import SessionLocal
from backend.config import settings

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="generate_sdxl_keyframes")
def generate_sdxl_keyframes(
    self,
    scene_id: str,
    prompts: List[str],
    batch_size: int = 10,
    job_id: str = None
) -> Dict[str, Any]:
    """
    Generate SDXL keyframes for a scene using RunPod serverless
    
    Args:
        scene_id: Scene ID
        prompts: List of prompts for keyframe generation
        batch_size: Number of prompts to process per batch
        job_id: Optional job ID (if None, generates new UUID)
        
    Returns:
        result: Dictionary with status and result URLs
    """
    db: Session = SessionLocal()
    
    try:
        # Create or get job record
        if job_id is None:
            job_id = str(uuid.uuid4())
        
        job = db.query(Job).filter(Job.id == job_id).first()
        if job is None:
            job = Job(
                id=job_id,
                celery_task_id=self.request.id,
                status=JobStatus.PENDING
            )
            db.add(job)
        else:
            job.celery_task_id = self.request.id
            job.status = JobStatus.RUNNING
        
        db.commit()
        
        # Initialize services
        if not settings.RUNPOD_API_KEY or not settings.RUNPOD_SDXL_ENDPOINT_ID:
            raise ValueError("RunPod API key or endpoint ID not configured")
        
        runpod_service = RunPodService(
            endpoint_id=settings.RUNPOD_SDXL_ENDPOINT_ID,
            api_key=settings.RUNPOD_API_KEY
        )
        
        # Initialize R2 storage if configured
        r2_storage = None
        if all([
            settings.R2_ACCOUNT_ID,
            settings.R2_ACCESS_KEY_ID,
            settings.R2_SECRET_ACCESS_KEY
        ]):
            r2_storage = R2Storage(
                account_id=settings.R2_ACCOUNT_ID,
                access_key_id=settings.R2_ACCESS_KEY_ID,
                secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                bucket_name=settings.R2_BUCKET_NAME,
                endpoint_url=settings.R2_ENDPOINT_URL
            )
        
        # Process prompts in batches
        all_result_urls = []
        
        for batch_start in range(0, len(prompts), batch_size):
            batch_prompts = prompts[batch_start:batch_start + batch_size]
            batch_index = batch_start // batch_size
            
            logger.info(f"Processing batch {batch_index + 1} for scene {scene_id} ({len(batch_prompts)} prompts)")
            
            # Prepare input for RunPod worker
            # Worker expects: {"prompts": ["prompt1", "prompt2", ...], "num_images": 1}
            runpod_input = {
                "prompts": batch_prompts,
                "num_images": 1,
                "width": 1024,
                "height": 1024,
                "steps": 30,
                "guidance_scale": 7.5,
                "checkpoint": "animagine-xl"  # Anime SDXL checkpoint
            }
            
            try:
                # Submit async job
                runpod_job_id = runpod_service.run_async(runpod_input)
                
                # Update job with RunPod job ID
                if job.runpod_job_id is None:
                    job.runpod_job_id = runpod_job_id
                db.commit()
                
                # Wait for completion
                result = runpod_service.run_and_wait(
                    job_id=runpod_job_id,
                    max_wait_s=600  # 10 min max per batch
                )
                
                # Extract outputs
                output = result.get("output", {})
                
                # Handle different output formats
                images = []
                if isinstance(output, list):
                    images = output
                elif isinstance(output, dict):
                    # Could be {"images": [...]} or {"base64": [...]}
                    images = output.get("images", output.get("base64", []))
                
                # Upload to R2 and collect URLs
                batch_urls = []
                for idx, image_data in enumerate(images):
                    prompt_index = batch_start + idx
                    
                    # Generate key
                    key = r2_storage.generate_keyframe_key(scene_id, prompt_index) if r2_storage else None
                    
                    if r2_storage:
                        # Upload to R2
                        if isinstance(image_data, str):
                            # Base64 or URL
                            if image_data.startswith("http"):
                                url = r2_storage.upload_from_url(image_data, key)
                            else:
                                url = r2_storage.upload_from_base64(image_data, key)
                        else:
                            # Assume bytes
                            url = r2_storage.upload_from_bytes(image_data, key)
                        
                        batch_urls.append(url)
                    else:
                        # No R2 configured, use RunPod output directly (temporary)
                        logger.warning("R2 not configured, using RunPod output directly")
                        if isinstance(image_data, str) and image_data.startswith("http"):
                            batch_urls.append(image_data)
                        else:
                            # Store base64 temporarily (not recommended for production)
                            batch_urls.append(f"data:image/png;base64,{image_data}")
                
                all_result_urls.extend(batch_urls)
                logger.info(f"Batch {batch_index + 1} completed: {len(batch_urls)} keyframes")
                
            except Exception as e:
                logger.error(f"Error processing batch {batch_index + 1}: {e}")
                # Continue with next batch instead of failing entirely
                continue
        
        # Update job with results
        job.status = JobStatus.COMPLETED
        job.result_urls = all_result_urls
        db.commit()
        
        logger.info(f"Keyframe generation completed for scene {scene_id}: {len(all_result_urls)} keyframes")
        
        return {
            "job_id": job_id,
            "status": "completed",
            "result_urls": all_result_urls,
            "count": len(all_result_urls)
        }
        
    except Exception as e:
        logger.error(f"Keyframe generation failed for scene {scene_id}: {e}")
        
        # Update job with error
        if job:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            db.commit()
        
        # Re-raise for Celery to handle
        raise
    
    finally:
        db.close()


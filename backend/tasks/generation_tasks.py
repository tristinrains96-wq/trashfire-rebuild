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
from backend.services.ffmpeg_service import FFmpegService
from backend.services.piper_service import PiperService
from backend.services.rhubarb_service import RhubarbService
from backend.services.motion_service import MotionService
from backend.services.episode_stitcher_service import EpisodeStitcherService
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


@celery_app.task(bind=True, name="compose_episode")
def compose_episode(
    self,
    episode_id: str,
    scene_data: List[Dict[str, Any]],
    job_id: str = None
) -> Dict[str, Any]:
    """
    Compose animatic episode from keyframes using FFmpeg
    
    Args:
        episode_id: Episode ID
        scene_data: List of scene dictionaries, each containing:
            - keyframe_urls: List of keyframe URLs (from Phase 1)
            - durations: List of durations in seconds for each keyframe
            - effects: Optional effects dictionary (zoompan, colorgrade, etc.)
        job_id: Optional job ID (if None, generates new UUID)
        
    Returns:
        result: Dictionary with status and final video URL
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
        
        # Initialize FFmpeg service
        try:
            ffmpeg_service = FFmpegService()
        except RuntimeError as e:
            raise ValueError(f"FFmpeg not available: {e}")
        
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
        
        # Collect all keyframes and durations from scenes
        all_keyframes = []
        all_durations = []
        all_effects = []
        
        for scene_idx, scene in enumerate(scene_data):
            keyframe_urls = scene.get("keyframe_urls", [])
            durations = scene.get("durations", [])
            effects = scene.get("effects", {})
            
            if len(keyframe_urls) != len(durations):
                logger.warning(f"Scene {scene_idx}: Mismatch between {len(keyframe_urls)} keyframes and {len(durations)} durations")
                # Pad with last duration or use default
                if len(durations) < len(keyframe_urls):
                    default_duration = durations[-1] if durations else 2.0
                    durations.extend([default_duration] * (len(keyframe_urls) - len(durations)))
                else:
                    durations = durations[:len(keyframe_urls)]
            
            all_keyframes.extend(keyframe_urls)
            all_durations.extend(durations)
            
            # Merge effects (use first scene's effects as base, or merge per-scene)
            if not all_effects:
                all_effects.append(effects)
            else:
                # For simplicity, use first scene's effects for entire episode
                # In production, you might want per-scene effects
                pass
        
        if not all_keyframes:
            raise ValueError("No keyframes provided in scene_data")
        
        logger.info(f"Composing animatic for episode {episode_id}: {len(all_keyframes)} keyframes across {len(scene_data)} scenes")
        
        # Compose video using FFmpeg
        # Use first scene's effects (or empty if none)
        episode_effects = scene_data[0].get("effects", {}) if scene_data else {}
        
        try:
            video_path = ffmpeg_service.compose_animatic(
                keyframes_urls=all_keyframes,
                durations=all_durations,
                effects=episode_effects,
                fps=24,
                resolution=(1920, 1080)
            )
            
            logger.info(f"Animatic composed: {video_path}")
            
            # Upload to R2
            final_video_url = None
            if r2_storage:
                video_key = r2_storage.generate_episode_video_key(episode_id)
                final_video_url = r2_storage.upload_video(video_path, video_key)
                logger.info(f"Video uploaded to R2: {final_video_url}")
                
                # Clean up local file
                try:
                    os.remove(video_path)
                except Exception as e:
                    logger.warning(f"Failed to clean up local video file: {e}")
            else:
                # No R2 configured, use local path (temporary)
                logger.warning("R2 not configured, using local video path")
                final_video_url = video_path
            
            # Update job with results
            job.status = JobStatus.COMPLETED
            job.result_urls = [final_video_url]  # Store video URL
            db.commit()
            
            logger.info(f"Episode composition completed for episode {episode_id}")
            
            return {
                "job_id": job_id,
                "status": "completed",
                "video_url": final_video_url,
                "episode_id": episode_id
            }
            
        except Exception as e:
            logger.error(f"FFmpeg composition failed: {e}")
            raise
        
    except Exception as e:
        logger.error(f"Episode composition failed for episode {episode_id}: {e}")
        
        # Update job with error
        if job:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            db.commit()
        
        # Re-raise for Celery to handle
        raise
    
    finally:
        db.close()


"""
Episode Pipeline Tasks
Celery tasks for automated episode generation pipeline
"""
import uuid
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from celery import group, chord
from backend.celery_app import celery_app
from backend.models.episode_manifest import EpisodeManifest, SceneSpec
from backend.models.jobs import Job, JobStatus
from backend.db.session import SessionLocal
from backend.tasks.generation_tasks import (
    generate_sdxl_keyframes,
    compose_episode,
    generate_motion_clip,
    stitch_episode_video,
    voice_and_sync_episode
)
from backend.config import settings

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="generate_scene_keyframes")
def generate_scene_keyframes(
    self,
    episode_id: str,
    scene_id: str,
    prompts: List[str],
    batch_size: int = 10
) -> Dict[str, Any]:
    """
    Generate keyframes for a scene (wrapper around existing task)
    
    Args:
        episode_id: Episode ID
        scene_id: Scene ID
        prompts: List of keyframe prompts
        batch_size: Batch size for generation
        
    Returns:
        Dictionary with keyframe_urls
    """
    # Generate job ID for this scene
    job_id = str(uuid.uuid4())
    
    # Call existing keyframe generation task
    # Use apply() to call synchronously within pipeline
    result = generate_sdxl_keyframes.apply(
        args=(scene_id, prompts, batch_size, job_id)
    ).get()
    
    return {
        "scene_id": scene_id,
        "keyframe_urls": result.get("result_urls", [])
    }


@celery_app.task(bind=True, name="generate_scene_animatic")
def generate_scene_animatic(
    self,
    episode_id: str,
    scene_id: str,
    keyframe_urls: List[str],
    fps: int,
    width: int,
    height: int,
    duration_seconds: int
) -> Dict[str, Any]:
    """
    Generate animatic for a scene (wrapper around existing task)
    
    Args:
        episode_id: Episode ID
        scene_id: Scene ID
        keyframe_urls: List of keyframe URLs
        fps: Target FPS
        width: Target width
        height: Target height
        duration_seconds: Target duration
        
    Returns:
        Dictionary with animatic_url
    """
    # Calculate durations per keyframe
    keyframe_count = len(keyframe_urls)
    if keyframe_count == 0:
        raise ValueError(f"No keyframes provided for scene {scene_id}")
    
    duration_per_keyframe = duration_seconds / keyframe_count
    durations = [duration_per_keyframe] * keyframe_count
    
    # Build scene data
    scene_data = [{
        "keyframe_urls": keyframe_urls,
        "durations": durations,
        "effects": {}
    }]
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Call existing animatic composition task
    result = compose_episode.apply(
        args=(episode_id, scene_data, job_id)
    ).get()
    
    animatic_url = result.get("video_url")
    if not animatic_url and result.get("result_urls"):
        animatic_url = result["result_urls"][0]
    
    return {
        "scene_id": scene_id,
        "animatic_url": animatic_url
    }


@celery_app.task(bind=True, name="generate_scene_motion_if_needed")
def generate_scene_motion_if_needed(
    self,
    episode_id: str,
    scene_id: str,
    keyframe_url: str,
    prompt: str,
    seconds: int,
    fps: int,
    width: int,
    height: int,
    motion_mode: str
) -> Optional[Dict[str, Any]]:
    """
    Generate motion clip if motion_mode is wan_motion
    
    Args:
        episode_id: Episode ID
        scene_id: Scene ID
        keyframe_url: First keyframe URL to use as init image
        prompt: Motion prompt
        seconds: Clip duration (capped at 10)
        fps: Target FPS
        width: Target width
        height: Target height
        motion_mode: "wan_motion" or "animatic_only"
        
    Returns:
        Dictionary with motion_url or None
    """
    if motion_mode != "wan_motion":
        return None
    
    # Cap seconds at 10
    seconds = min(seconds, 10)
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Call existing motion clip generation task
    result = generate_motion_clip.apply(
        args=(episode_id, scene_id, keyframe_url, prompt, seconds, fps, width, height, job_id)
    ).get()
    
    motion_url = result.get("clip_url")
    if not motion_url and result.get("result_urls"):
        motion_url = result["result_urls"][0]
    
    return {
        "scene_id": scene_id,
        "motion_url": motion_url
    }


@celery_app.task(bind=True, name="stitch_episode_from_manifest")
def stitch_episode_from_manifest(
    self,
    episode_id: str,
    manifest_dict: Dict[str, Any],
    fps: int,
    width: int,
    height: int,
    transition: str
) -> Dict[str, Any]:
    """
    Stitch episode from manifest scene outputs
    
    Args:
        episode_id: Episode ID
        manifest_dict: EpisodeManifest as dictionary
        fps: Target FPS
        width: Target width
        height: Target height
        transition: Transition type
        
    Returns:
        Dictionary with episode_url
    """
    # Reconstruct manifest
    manifest = EpisodeManifest.from_dict(manifest_dict)
    
    # Build segments from manifest scenes
    segments = []
    for scene in manifest.scenes:
        # Use motion_url if available, otherwise animatic_url
        url = scene.output.motion_url or scene.output.animatic_url
        
        if not url:
            logger.warning(f"Scene {scene.scene_id} has no output URL, skipping")
            continue
        
        segments.append({
            "scene_id": scene.scene_id,
            "type": "motion" if scene.output.motion_url else "animatic",
            "url": url,
            "label": f"Scene {scene.scene_id}"
        })
    
    if not segments:
        raise ValueError("No segments to stitch")
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Call existing stitch task
    result = stitch_episode_video.apply(
        args=(episode_id, segments, fps, width, height, transition, 250, job_id)
    ).get()
    
    episode_url = result.get("episode_url")
    if not episode_url and result.get("result_urls"):
        episode_url = result["result_urls"][0]
    
    return {
        "episode_url": episode_url,
        "segment_count": len(segments)
    }


@celery_app.task(bind=True, name="add_voice_if_present")
def add_voice_if_present(
    self,
    episode_id: str,
    episode_url: str,
    dialogue_lines: List[str],
    keyframes_urls: List[str]
) -> Dict[str, Any]:
    """
    Add voice track if dialogue is provided
    
    Args:
        episode_id: Episode ID
        episode_url: Episode video URL
        dialogue_lines: List of dialogue lines
        keyframes_urls: List of keyframe URLs for lip-sync
        
    Returns:
        Dictionary with final_url (voiced or original)
    """
    if not dialogue_lines or not any(d for d in dialogue_lines if d and d.strip()):
        # No dialogue, return original
        return {
            "final_url": episode_url,
            "voiced": False
        }
    
    # Filter out empty dialogue
    filtered_dialogue = [d for d in dialogue_lines if d and d.strip()]
    
    if not filtered_dialogue:
        return {
            "final_url": episode_url,
            "voiced": False
        }
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Call existing voice task
    result = voice_and_sync_episode.apply(
        args=(episode_id, filtered_dialogue, episode_url, keyframes_urls, job_id)
    ).get()
    
    voiced_url = result.get("video_url")
    if not voiced_url and result.get("result_urls"):
        voiced_url = result["result_urls"][0]
    
    return {
        "final_url": voiced_url,
        "voiced": True
    }


@celery_app.task(bind=True, name="run_episode_pipeline")
def run_episode_pipeline(
    self,
    manifest_dict: Dict[str, Any],
    job_id: str
) -> Dict[str, Any]:
    """
    Main pipeline orchestrator task
    
    Executes episode generation pipeline:
    1. Generate keyframes for all scenes (parallel)
    2. Generate animatics for all scenes (parallel, depends on keyframes)
    3. Generate motion clips for selected scenes (parallel, depends on keyframes)
    4. Stitch episode from all scene outputs
    5. Add voice if dialogue provided
    
    Args:
        manifest_dict: EpisodeManifest as dictionary
        job_id: Main job ID
        
    Returns:
        Dictionary with final episode URL and manifest
    """
    db: Session = SessionLocal()
    
    try:
        # Reconstruct manifest
        manifest = EpisodeManifest.from_dict(manifest_dict)
        
        # Update job status
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = JobStatus.RUNNING
            db.commit()
        
        logger.info(f"Starting episode pipeline for {manifest.episode_id}: {len(manifest.scenes)} scenes")
        
        # Step 1: Generate keyframes for all scenes (parallel)
        keyframe_tasks = []
        for scene in manifest.scenes:
            task = generate_scene_keyframes.si(
                episode_id=manifest.episode_id,
                scene_id=scene.scene_id,
                prompts=scene.keyframe_prompts,
                batch_size=10
            )
            keyframe_tasks.append(task)
        
        keyframe_group = group(*keyframe_tasks)
        keyframe_results = keyframe_group.apply_async().get()
        
        # Update manifest with keyframe URLs
        for result in keyframe_results:
            scene_id = result.get("scene_id")
            keyframe_urls = result.get("keyframe_urls", [])
            
            for scene in manifest.scenes:
                if scene.scene_id == scene_id:
                    scene.output.keyframes_urls = keyframe_urls
                    break
        
        logger.info("Keyframe generation completed for all scenes")
        
        # Step 2: Generate animatics for all scenes (parallel)
        animatic_tasks = []
        for scene in manifest.scenes:
            if not scene.output.keyframes_urls:
                logger.warning(f"Scene {scene.scene_id} has no keyframes, skipping animatic")
                continue
            
            task = generate_scene_animatic.si(
                episode_id=manifest.episode_id,
                scene_id=scene.scene_id,
                keyframe_urls=scene.output.keyframes_urls,
                fps=manifest.fps,
                width=manifest.width,
                height=manifest.height,
                duration_seconds=scene.duration_seconds
            )
            animatic_tasks.append(task)
        
        if animatic_tasks:
            animatic_group = group(*animatic_tasks)
            animatic_results = animatic_group.apply_async().get()
        else:
            animatic_results = []
        
        # Update manifest with animatic URLs
        for result in animatic_results:
            scene_id = result.get("scene_id")
            animatic_url = result.get("animatic_url")
            
            for scene in manifest.scenes:
                if scene.scene_id == scene_id:
                    scene.output.animatic_url = animatic_url
                    break
        
        logger.info("Animatic generation completed for all scenes")
        
        # Step 3: Generate motion clips for selected scenes (parallel)
        motion_tasks = []
        for scene in manifest.scenes:
            if scene.motion_mode != "wan_motion":
                continue
            
            if not scene.output.keyframes_urls:
                logger.warning(f"Scene {scene.scene_id} has no keyframes for motion, skipping")
                continue
            
            # Use first keyframe as init image
            first_keyframe = scene.output.keyframes_urls[0]
            
            task = generate_scene_motion_if_needed.si(
                episode_id=manifest.episode_id,
                scene_id=scene.scene_id,
                keyframe_url=first_keyframe,
                prompt=scene.prompt,
                seconds=min(scene.duration_seconds, 10),  # Cap at 10s
                fps=manifest.fps,
                width=manifest.width,
                height=manifest.height,
                motion_mode=scene.motion_mode
            )
            motion_tasks.append(task)
        
        if motion_tasks:
            motion_group = group(*motion_tasks)
            motion_results = motion_group.apply_async().get()
            
            # Update manifest with motion URLs
            for result in motion_results:
                if result:
                    scene_id = result.get("scene_id")
                    motion_url = result.get("motion_url")
                    
                    for scene in manifest.scenes:
                        if scene.scene_id == scene_id:
                            scene.output.motion_url = motion_url
                            break
            
            logger.info("Motion clip generation completed")
        
        # Step 4: Stitch episode
        stitch_result = stitch_episode_from_manifest.si(
            episode_id=manifest.episode_id,
            manifest_dict=manifest.to_dict(),
            fps=manifest.fps,
            width=manifest.width,
            height=manifest.height,
            transition=manifest.transition
        ).apply_async().get()
        
        episode_url = stitch_result.get("episode_url")
        logger.info(f"Episode stitching completed: {episode_url}")
        
        # Step 5: Add voice if enabled
        final_url = episode_url
        voiced = False
        
        if manifest.voice_enabled:
            # Collect all dialogue lines
            dialogue_lines = [s.dialogue for s in manifest.scenes if s.dialogue]
            all_keyframes = []
            for scene in manifest.scenes:
                if scene.output.keyframes_urls:
                    all_keyframes.extend(scene.output.keyframes_urls)
            
            if dialogue_lines:
                voice_result = add_voice_if_present.si(
                    episode_id=manifest.episode_id,
                    episode_url=episode_url,
                    dialogue_lines=dialogue_lines,
                    keyframes_urls=all_keyframes
                ).apply_async().get()
                
                final_url = voice_result.get("final_url", episode_url)
                voiced = voice_result.get("voiced", False)
                logger.info(f"Voice added: {voiced}")
        
        # Update job with results
        if job:
            job.status = JobStatus.COMPLETED
            job.result_urls = [final_url]
            # Store manifest in error_message field as JSON (temporary until we have manifest table)
            import json
            job.error_message = json.dumps({"manifest": manifest.to_dict()})
            db.commit()
        
        logger.info(f"Episode pipeline completed for {manifest.episode_id}")
        
        return {
            "job_id": job_id,
            "status": "completed",
            "episode_url": final_url,
            "voiced": voiced,
            "manifest": manifest.to_dict()
        }
        
    except Exception as e:
        logger.error(f"Episode pipeline failed: {e}")
        
        if job:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            db.commit()
        
        raise
    
    finally:
        db.close()


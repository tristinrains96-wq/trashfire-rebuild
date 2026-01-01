"""
Motion Service for Open Video Generation
Uses RunPod serverless with Wan 2.2 TI2V-style model for motion clips
Generates 5-10 second video clips from keyframes + prompts
"""
import os
import base64
import tempfile
import logging
import requests
import uuid
from typing import Optional
from pathlib import Path
from backend.services.runpod_service import RunPodService
from backend.utils.storage import R2Storage
from backend.config import settings

logger = logging.getLogger(__name__)


class MotionService:
    """
    Service for generating motion video clips using RunPod Wan motion endpoint
    Converts static keyframes into short animated clips (5-10 seconds)
    """
    
    def __init__(self, endpoint_id: Optional[str] = None, api_key: Optional[str] = None):
        """
        Initialize Motion service
        
        Args:
            endpoint_id: RunPod Wan motion endpoint ID (uses config if None)
            api_key: RunPod API key (uses config if None)
        """
        self.endpoint_id = endpoint_id or settings.RUNPOD_WAN_MOTION_ENDPOINT_ID
        self.api_key = api_key or settings.RUNPOD_API_KEY
        
        if not self.endpoint_id:
            raise ValueError("RUNPOD_WAN_MOTION_ENDPOINT_ID not configured")
        if not self.api_key:
            raise ValueError("RUNPOD_API_KEY not configured")
        
        self.runpod_service = RunPodService(
            endpoint_id=self.endpoint_id,
            api_key=self.api_key
        )
        
        logger.info(f"Motion service initialized with endpoint: {self.endpoint_id}")
    
    def generate_motion_clip_from_keyframe(
        self,
        episode_id: str,
        scene_id: str,
        keyframe_url: str,
        prompt: str,
        seconds: int = 6,
        fps: int = 24,
        width: int = 1280,
        height: int = 720
    ) -> str:
        """
        Generate motion video clip from keyframe using RunPod Wan motion endpoint
        
        Args:
            episode_id: Episode ID
            scene_id: Scene ID
            keyframe_url: URL to input keyframe image
            prompt: Text prompt describing desired motion
            seconds: Clip duration in seconds (5-10, default 6)
            fps: Video FPS (default 24)
            width: Video width (default 1280)
            height: Video height (default 720)
            
        Returns:
            stored_clip_url: URL to stored MP4 clip in storage
            
        Raises:
            ValueError: If parameters are invalid
            RuntimeError: If generation or storage fails
        """
        # Validate seconds (hard cap for cost control)
        if seconds < 5 or seconds > 10:
            raise ValueError(f"Clip duration must be between 5-10 seconds, got {seconds}")
        
        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty")
        
        if not keyframe_url:
            raise ValueError("Keyframe URL cannot be empty")
        
        logger.info(f"Generating motion clip: {seconds}s, {width}x{height}, prompt: {prompt[:50]}...")
        
        # Build payload for RunPod worker
        # Worker expects: { "input": { "prompt": "...", "init_image_url": "...", "seconds": 6, ... } }
        input_data = {
            "prompt": prompt,
            "init_image_url": keyframe_url,
            "seconds": seconds,
            "fps": fps,
            "width": width,
            "height": height
        }
        
        # Submit job and wait for completion
        try:
            result = self.runpod_service.run_and_wait(
                input_data=input_data,
                max_wait_s=900  # 15 min max for motion generation
            )
            
            logger.info("Motion clip generation completed")
            
        except Exception as e:
            logger.error(f"RunPod motion generation failed: {e}")
            raise RuntimeError(f"Motion generation failed: {e}")
        
        # Extract output (handle both video_url and video_base64)
        output = result.get("output", {})
        
        if not output:
            raise RuntimeError("RunPod returned empty output")
        
        # Handle video URL or base64
        video_url = output.get("video_url")
        video_base64 = output.get("video_base64")
        
        if not video_url and not video_base64:
            raise RuntimeError("RunPod output missing video_url and video_base64")
        
        # Download or decode video
        video_path = None
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_file:
            video_path = temp_file.name
            
            if video_base64:
                # Decode base64 video
                try:
                    # Remove data URI prefix if present
                    if video_base64.startswith("data:"):
                        video_base64 = video_base64.split(",", 1)[1]
                    
                    video_bytes = base64.b64decode(video_base64)
                    temp_file.write(video_bytes)
                    logger.info("Decoded base64 video")
                except Exception as e:
                    logger.error(f"Failed to decode base64 video: {e}")
                    raise RuntimeError(f"Base64 decode failed: {e}")
            
            elif video_url:
                # Download video from URL
                try:
                    response = requests.get(video_url, timeout=120, stream=True)
                    response.raise_for_status()
                    
                    for chunk in response.iter_content(chunk_size=8192):
                        temp_file.write(chunk)
                    
                    logger.info(f"Downloaded video from URL: {video_url}")
                except Exception as e:
                    logger.error(f"Failed to download video: {e}")
                    raise RuntimeError(f"Video download failed: {e}")
        
        # Upload to storage
        try:
            # Initialize storage
            storage = self._get_storage()
            
            # Generate storage key
            clip_id = str(uuid.uuid4())
            storage_key = f"episodes/{episode_id}/scenes/{scene_id}/motion/{clip_id}.mp4"
            
            # Upload video
            stored_url = storage.upload_video(video_path, storage_key)
            
            logger.info(f"Uploaded motion clip to storage: {stored_url}")
            
            # Clean up temp file
            try:
                os.remove(video_path)
            except Exception as e:
                logger.warning(f"Failed to clean up temp video: {e}")
            
            return stored_url
            
        except Exception as e:
            logger.error(f"Storage upload failed: {e}")
            # Clean up temp file
            if video_path and os.path.exists(video_path):
                try:
                    os.remove(video_path)
                except:
                    pass
            raise RuntimeError(f"Storage upload failed: {e}")
    
    def _get_storage(self) -> R2Storage:
        """
        Get storage client based on configuration
        
        Returns:
            R2Storage instance
        """
        # Use new storage config if available, fall back to R2 legacy config
        if settings.STORAGE_PROVIDER == "r2" or settings.STORAGE_PROVIDER == "supabase":
            # For now, both use R2-compatible API
            account_id = settings.STORAGE_ACCESS_KEY or settings.R2_ACCOUNT_ID
            access_key = settings.STORAGE_ACCESS_KEY or settings.R2_ACCESS_KEY_ID
            secret_key = settings.STORAGE_SECRET_KEY or settings.R2_SECRET_ACCESS_KEY
            bucket_name = settings.STORAGE_BUCKET or settings.R2_BUCKET_NAME
            endpoint_url = settings.STORAGE_ENDPOINT_URL or settings.R2_ENDPOINT_URL
            
            if not all([account_id, access_key, secret_key, bucket_name]):
                raise ValueError("Storage credentials not configured")
            
            return R2Storage(
                account_id=account_id,
                access_key_id=access_key,
                secret_access_key=secret_key,
                bucket_name=bucket_name,
                endpoint_url=endpoint_url
            )
        else:
            raise ValueError(f"Unsupported storage provider: {settings.STORAGE_PROVIDER}")


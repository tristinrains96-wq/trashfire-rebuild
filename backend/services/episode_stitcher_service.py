"""
Episode Stitcher Service
Stitches together animatic and motion clips into full episode videos
"""
import os
import tempfile
import logging
import requests
import shutil
import subprocess
from typing import List, Dict, Any, Optional
from pathlib import Path
from backend.services.ffmpeg_service import FFmpegService
from backend.utils.storage import R2Storage
from backend.config import settings

logger = logging.getLogger(__name__)


class EpisodeStitcherService:
    """
    Service for stitching episode segments (animatic + motion clips) into final episode
    """
    
    def __init__(self, ffmpeg_path: Optional[str] = None):
        """
        Initialize episode stitcher service
        
        Args:
            ffmpeg_path: Path to FFmpeg executable (auto-detected if None)
        """
        self.ffmpeg_service = FFmpegService(ffmpeg_path)
        logger.info("Episode stitcher service initialized")
    
    def normalize_segment(
        self,
        input_url: str,
        target_w: int = 1280,
        target_h: int = 720,
        fps: int = 24,
        output_path: Optional[str] = None
    ) -> str:
        """
        Normalize video segment to target resolution, fps, and codec
        
        Downloads segment, scales/pads to target resolution (no stretching),
        forces fps, ensures h264 video + aac audio codecs,
        adds silent audio track if none exists.
        
        Args:
            input_url: URL or path to input video
            target_w: Target width (default 1280)
            target_h: Target height (default 720)
            fps: Target FPS (default 24)
            output_path: Output file path (creates temp file if None)
            
        Returns:
            output_path: Path to normalized video file
            
        Raises:
            FileNotFoundError: If video cannot be downloaded
            RuntimeError: If FFmpeg normalization fails
        """
        # Create temporary directory for working files
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Download video file
            video_path = temp_path / "input.mp4"
            try:
                if input_url.startswith("http"):
                    response = requests.get(input_url, timeout=120, stream=True)
                    response.raise_for_status()
                    with open(video_path, "wb") as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                else:
                    # Assume local path
                    shutil.copy(input_url, video_path)
                
                logger.debug(f"Downloaded segment: {video_path}")
            except Exception as e:
                logger.error(f"Failed to download segment: {e}")
                raise FileNotFoundError(f"Could not download segment: {e}")
            
            # Set output path
            if output_path is None:
                output_file = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
                output_path = output_file.name
                output_file.close()
            
            # Build FFmpeg filter for normalization
            # Scale + pad to target resolution (maintain aspect ratio, no stretching)
            # Force fps, ensure codec, add silent audio if needed
            filter_complex = (
                f"[0:v]scale={target_w}:{target_h}:force_original_aspect_ratio=decrease,"
                f"pad={target_w}:{target_h}:(ow-iw)/2:(oh-ih)/2:color=black,"
                f"fps={fps}[v]"
            )
            
            # Check if audio exists, add silent track if not
            # Use filter_complex to handle both cases
            filter_complex_with_audio = (
                f"{filter_complex};"
                f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo[a]"
            )
            
            # Build command
            cmd = [
                self.ffmpeg_service.ffmpeg_path,
                "-y",
                "-i", str(video_path),
                "-filter_complex", filter_complex_with_audio,
                "-map", "[v]",
                "-map", "[a]",
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "23",
                "-c:a", "aac",
                "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-r", str(fps),
                output_path
            ]
            
            # Try with audio first, fall back to silent audio if no audio track
            try:
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    check=True,
                    timeout=300
                )
                logger.debug(f"Normalized segment with audio: {output_path}")
            except subprocess.CalledProcessError:
                # No audio track, add silent audio
                logger.debug("No audio track found, adding silent audio")
                filter_complex_silent = (
                    f"{filter_complex};"
                    f"anullsrc=channel_layout=stereo:sample_rate=48000[a]"
                )
                
                cmd = [
                    self.ffmpeg_service.ffmpeg_path,
                    "-y",
                    "-i", str(video_path),
                    "-f", "lavfi",
                    "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
                    "-filter_complex", filter_complex,
                    "-map", "[v]",
                    "-map", "1:a",
                    "-c:v", "libx264",
                    "-preset", "medium",
                    "-crf", "23",
                    "-c:a", "aac",
                    "-b:a", "192k",
                    "-pix_fmt", "yuv420p",
                    "-r", str(fps),
                    "-shortest",
                    output_path
                ]
                
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    check=True,
                    timeout=300
                )
                logger.debug(f"Normalized segment with silent audio: {output_path}")
            
            return output_path
    
    def stitch_episode(
        self,
        episode_id: str,
        segments: List[Dict[str, Any]],
        fps: int = 24,
        width: int = 1280,
        height: int = 720,
        transition: str = "cut",
        fade_ms: int = 250
    ) -> str:
        """
        Stitch episode segments into final episode video
        
        Args:
            episode_id: Episode ID
            segments: List of segment dictionaries:
                {
                    "scene_id": "sc-001",
                    "type": "animatic" | "motion",
                    "url": "https://...mp4",
                    "label": "optional"
                }
            fps: Target FPS (default 24)
            width: Target width (default 1280)
            height: Target height (default 720)
            transition: Transition type ("cut" or "fade", default "cut")
            fade_ms: Fade duration in milliseconds (default 250)
            
        Returns:
            stored_url: URL to stored final episode video
            
        Raises:
            ValueError: If segments are invalid
            RuntimeError: If stitching fails
        """
        if not segments:
            raise ValueError("Segments list cannot be empty")
        
        logger.info(f"Stitching episode {episode_id}: {len(segments)} segments, transition={transition}")
        
        # Normalize all segments
        normalized_paths = []
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            for idx, segment in enumerate(segments):
                scene_id = segment.get("scene_id", f"scene_{idx}")
                segment_url = segment.get("url")
                segment_type = segment.get("type", "unknown")
                
                if not segment_url:
                    raise ValueError(f"Segment {idx} missing URL")
                
                logger.info(f"Normalizing segment {idx + 1}/{len(segments)}: {scene_id} ({segment_type})")
                
                normalized_path = temp_path / f"normalized_{idx:04d}.mp4"
                
                try:
                    normalized = self.normalize_segment(
                        input_url=segment_url,
                        target_w=width,
                        target_h=height,
                        fps=fps,
                        output_path=str(normalized_path)
                    )
                    normalized_paths.append(normalized)
                except Exception as e:
                    logger.error(f"Failed to normalize segment {idx}: {e}")
                    raise RuntimeError(f"Segment normalization failed: {e}")
            
            # Concatenate segments
            logger.info(f"Concatenating {len(normalized_paths)} normalized segments...")
            
            if transition == "cut":
                final_path = self.ffmpeg_service.concat_videos(
                    normalized_paths,
                    str(temp_path / "final_episode.mp4")
                )
            elif transition == "fade":
                final_path = self.ffmpeg_service.concat_with_crossfade(
                    normalized_paths,
                    str(temp_path / "final_episode.mp4"),
                    fade_ms
                )
            else:
                raise ValueError(f"Unknown transition type: {transition}")
            
            # Upload to storage
            storage = self._get_storage()
            storage_key = f"episodes/{episode_id}/exports/episode_{fps}fps_{width}x{height}.mp4"
            
            stored_url = storage.upload_video(final_path, storage_key)
            logger.info(f"Uploaded final episode to storage: {stored_url}")
            
            return stored_url
    
    def _get_storage(self) -> R2Storage:
        """Get storage client based on configuration"""
        # Use new storage config if available, fall back to R2 legacy config
        if settings.STORAGE_PROVIDER == "r2" or settings.STORAGE_PROVIDER == "supabase":
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


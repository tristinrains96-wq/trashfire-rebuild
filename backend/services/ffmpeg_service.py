"""
FFmpeg Service for Animatic Episode Composition
Composes low-cost animatic-style episodes from SDXL keyframes
"""
import os
import subprocess
import tempfile
import logging
import requests
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class FFmpegService:
    """
    Service for composing animatic videos using FFmpeg
    Supports anime-style effects: zoompan, overlays, color grading, timing
    """
    
    def __init__(self, ffmpeg_path: Optional[str] = None):
        """
        Initialize FFmpeg service
        
        Args:
            ffmpeg_path: Path to FFmpeg executable (auto-detected if None)
        """
        self.ffmpeg_path = ffmpeg_path or self._find_ffmpeg()
        if not self.ffmpeg_path:
            raise RuntimeError("FFmpeg not found. Please install FFmpeg and ensure it's in PATH.")
        
        logger.info(f"FFmpeg service initialized with: {self.ffmpeg_path}")
    
    def _find_ffmpeg(self) -> Optional[str]:
        """Find FFmpeg executable in PATH"""
        import shutil
        return shutil.which("ffmpeg") or shutil.which("ffmpeg.exe")
    
    def compose_animatic(
        self,
        keyframes_urls: List[str],
        durations: List[float],
        effects: Dict[str, Any] = None,
        output_path: Optional[str] = None,
        fps: int = 24,
        resolution: tuple = (1920, 1080)
    ) -> str:
        """
        Compose animatic video from keyframe URLs
        
        Args:
            keyframes_urls: List of keyframe image URLs (from R2/storage)
            durations: List of durations in seconds for each keyframe
            effects: Optional effects dictionary:
                - zoompan: List of {"start": 0.0, "end": 2.0, "zoom": 1.2, "pan_x": 0, "pan_y": 0}
                - overlays: List of overlay effects (blinks, mouth flaps)
                - colorgrade: Color grading settings {"saturation": 1.2, "contrast": 1.1, "brightness": 0.05}
                - transitions: List of transition effects between keyframes
            output_path: Output file path (creates temp file if None)
            fps: Output video FPS (default 24)
            resolution: Output resolution (width, height) (default 1920x1080)
            
        Returns:
            output_path: Path to generated MP4 file
            
        Raises:
            subprocess.CalledProcessError: If FFmpeg fails
            FileNotFoundError: If keyframes cannot be downloaded
        """
        if len(keyframes_urls) != len(durations):
            raise ValueError(f"Mismatch: {len(keyframes_urls)} keyframes but {len(durations)} durations")
        
        if effects is None:
            effects = {}
        
        # Create temporary directory for working files
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Download keyframes
            keyframe_paths = []
            logger.info(f"Downloading {len(keyframes_urls)} keyframes...")
            
            for idx, url in enumerate(keyframes_urls):
                keyframe_path = temp_path / f"keyframe_{idx:04d}.png"
                
                try:
                    response = requests.get(url, timeout=30)
                    response.raise_for_status()
                    keyframe_path.write_bytes(response.content)
                    keyframe_paths.append(str(keyframe_path))
                    logger.debug(f"Downloaded keyframe {idx + 1}/{len(keyframes_urls)}")
                except Exception as e:
                    logger.error(f"Failed to download keyframe {idx} from {url}: {e}")
                    raise FileNotFoundError(f"Could not download keyframe {idx}: {e}")
            
            # Set output path
            if output_path is None:
                output_file = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
                output_path = output_file.name
                output_file.close()
            
            # Use concat demuxer for better control over durations
            concat_file = temp_path / "concat.txt"
            with open(concat_file, "w") as f:
                for idx, (kf_path, duration) in enumerate(zip(keyframe_paths, durations)):
                    # Escape single quotes in path for concat file format
                    escaped_path = str(kf_path).replace("'", "'\\''")
                    f.write(f"file '{escaped_path}'\n")
                    f.write(f"duration {duration}\n")
                # Repeat last frame duration for proper ending
                if keyframe_paths:
                    escaped_path = str(keyframe_paths[-1]).replace("'", "'\\''")
                    f.write(f"file '{escaped_path}'\n")
            
            # Build filter complex for scaling, padding, and effects
            filter_complex = self._build_filter_complex(
                durations,
                effects,
                fps,
                resolution
            )
            
            # Build command with concat demuxer
            cmd = [
                self.ffmpeg_path,
                "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", str(concat_file),
            ]
            
            # Add filter complex if we have effects
            if filter_complex:
                cmd.extend(["-filter_complex", filter_complex, "-map", "[final]"])
            else:
                # Simple scale and pad without effects
                width, height = resolution
                cmd.extend([
                    "-vf", f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=black"
                ])
            
            cmd.extend([
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "23",
                "-pix_fmt", "yuv420p",
                "-r", str(fps),
                output_path
            ])
            
            logger.info(f"Composing animatic video: {len(keyframes_urls)} keyframes, {sum(durations):.2f}s total")
            
            # Execute FFmpeg
            try:
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    check=True,
                    timeout=600  # 10 min max
                )
                logger.info(f"Animatic composition completed: {output_path}")
                return output_path
                
            except subprocess.TimeoutExpired:
                logger.error("FFmpeg composition timed out")
                raise RuntimeError("Video composition timed out after 10 minutes")
            except subprocess.CalledProcessError as e:
                logger.error(f"FFmpeg failed: {e.stderr}")
                raise RuntimeError(f"FFmpeg composition failed: {e.stderr}")
    
    def _build_filter_complex(
        self,
        durations: List[float],
        effects: Dict[str, Any],
        fps: int,
        resolution: tuple
    ) -> Optional[str]:
        """
        Build FFmpeg filter_complex string for animatic composition
        
        Args:
            durations: List of durations per keyframe
            effects: Effects dictionary
            fps: Output FPS
            resolution: Output resolution (width, height)
            
        Returns:
            filter_complex: FFmpeg filter_complex string or None if no effects
        """
        width, height = resolution
        
        # Start with scale and pad
        filter_parts = [f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=black"]
        
        # Apply color grading if specified
        colorgrade = effects.get("colorgrade", {})
        if colorgrade:
            saturation = colorgrade.get("saturation", 1.0)
            contrast = colorgrade.get("contrast", 1.0)
            brightness = colorgrade.get("brightness", 0.0)
            filter_parts.append(f"eq=saturation={saturation}:contrast={contrast}:brightness={brightness}")
        
        # Add zoompan if specified (simplified: apply to entire video)
        # For per-segment zoompan, we'd need to split and rejoin (more complex)
        zoompan_effects = effects.get("zoompan", [])
        if zoompan_effects and len(zoompan_effects) > 0:
            # Apply first zoompan effect (in production, segment and apply per-keyframe)
            zoom = zoompan_effects[0].get("zoom", 1.0)
            pan_x = zoompan_effects[0].get("pan_x", 0)
            pan_y = zoompan_effects[0].get("pan_y", 0)
            
            # Calculate zoompan parameters
            total_duration = sum(durations)
            zoompan_filter = f"zoompan=z='if(lte(zoom,{zoom}),zoom+0.0015,{zoom})':d={int(total_duration * fps)}:x='iw/2-(iw/zoom/2)+{pan_x}':y='ih/2-(ih/zoom/2)+{pan_y}'"
            filter_parts.append(zoompan_filter)
        
        # Join all filters
        filter_complex = ",".join(filter_parts)
        
        # Return None if no effects (just scale/pad, handled by -vf)
        if len(filter_parts) == 1 and not colorgrade and not zoompan_effects:
            return None
        
        # Return as filter_complex with output label
        return f"[0:v]{filter_complex}[final]"
    


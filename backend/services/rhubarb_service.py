"""
Rhubarb Lip-Sync Service
Uses Rhubarb (MIT) for generating mouth shapes synchronized with audio
"""
import os
import subprocess
import tempfile
import logging
import requests
from typing import List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class RhubarbService:
    """
    Service for generating lip-sync mouth shapes using Rhubarb
    Synchronizes mouth shapes with audio for animatic characters
    """
    
    def __init__(self, rhubarb_path: Optional[str] = None):
        """
        Initialize Rhubarb lip-sync service
        
        Args:
            rhubarb_path: Path to rhubarb executable (auto-detected if None)
        """
        self.rhubarb_path = rhubarb_path or self._find_rhubarb()
        if not self.rhubarb_path:
            raise RuntimeError("Rhubarb not found. Please install Rhubarb and ensure it's in PATH.")
        
        logger.info(f"Rhubarb service initialized: {self.rhubarb_path}")
    
    def _find_rhubarb(self) -> Optional[str]:
        """Find Rhubarb executable in PATH"""
        import shutil
        # Rhubarb executable names: rhubarb, rhubarb-lip-sync
        for name in ["rhubarb", "rhubarb-lip-sync", "rhubarb.exe", "rhubarb-lip-sync.exe"]:
            path = shutil.which(name)
            if path:
                return path
        return None
    
    def generate_mouth_shapes(
        self,
        audio_url: str,
        keyframes_urls: List[str],
        output_dir: Optional[str] = None
    ) -> List[str]:
        """
        Generate mouth shapes synchronized with audio and overlay on keyframes
        
        Args:
            audio_url: URL or path to audio file (WAV/MP3)
            keyframes_urls: List of keyframe image URLs to overlay mouth shapes on
            output_dir: Output directory for synced keyframes (creates temp dir if None)
            
        Returns:
            synced_keyframes_urls: List of URLs/paths to keyframes with mouth shapes overlaid
            
        Raises:
            subprocess.CalledProcessError: If Rhubarb fails
            FileNotFoundError: If audio/keyframes cannot be downloaded
        """
        if not keyframes_urls:
            raise ValueError("keyframes_urls cannot be empty")
        
        # Create temporary directory for working files
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Download audio file
            audio_path = temp_path / "audio.wav"
            try:
                if audio_url.startswith("http"):
                    response = requests.get(audio_url, timeout=30)
                    response.raise_for_status()
                    audio_path.write_bytes(response.content)
                else:
                    # Assume local path
                    import shutil
                    shutil.copy(audio_url, audio_path)
                
                logger.info(f"Downloaded audio: {audio_path}")
            except Exception as e:
                logger.error(f"Failed to download audio: {e}")
                raise FileNotFoundError(f"Could not download audio: {e}")
            
            # Download keyframes
            keyframe_paths = []
            logger.info(f"Downloading {len(keyframes_urls)} keyframes...")
            
            for idx, url in enumerate(keyframes_urls):
                keyframe_path = temp_path / f"keyframe_{idx:04d}.png"
                
                try:
                    if url.startswith("http"):
                        response = requests.get(url, timeout=30)
                        response.raise_for_status()
                        keyframe_path.write_bytes(response.content)
                    else:
                        # Assume local path
                        import shutil
                        shutil.copy(url, keyframe_path)
                    
                    keyframe_paths.append(str(keyframe_path))
                    logger.debug(f"Downloaded keyframe {idx + 1}/{len(keyframes_urls)}")
                except Exception as e:
                    logger.error(f"Failed to download keyframe {idx}: {e}")
                    raise FileNotFoundError(f"Could not download keyframe {idx}: {e}")
            
            # Generate mouth shape data using Rhubarb
            # Rhubarb outputs mouth shape timings in JSON or DAT format
            mouth_shapes_file = temp_path / "mouth_shapes.dat"
            
            try:
                # Rhubarb command: rhubarb -f dat -o output.dat audio.wav
                cmd = [
                    self.rhubarb_path,
                    "-f", "dat",  # Output format: DAT (simple timing format)
                    "-o", str(mouth_shapes_file),
                    str(audio_path)
                ]
                
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=120,
                    check=True
                )
                
                logger.info(f"Rhubarb generated mouth shapes: {mouth_shapes_file}")
                
            except subprocess.TimeoutExpired:
                logger.error("Rhubarb timed out")
                raise RuntimeError("Rhubarb lip-sync timed out after 2 minutes")
            except subprocess.CalledProcessError as e:
                logger.error(f"Rhubarb failed: {e.stderr}")
                raise RuntimeError(f"Rhubarb lip-sync failed: {e.stderr}")
            
            # Parse mouth shapes and overlay on keyframes
            # For now, we'll use a simplified approach:
            # 1. Parse Rhubarb DAT file to get mouth shape timings
            # 2. Map mouth shapes to keyframes based on timing
            # 3. Overlay mouth shape sprites on keyframes using FFmpeg/PIL
            
            # Parse DAT file (format: time\tmouth_shape)
            mouth_shapes = self._parse_rhubarb_dat(mouth_shapes_file)
            
            # Overlay mouth shapes on keyframes
            synced_keyframes = self._overlay_mouth_shapes(
                keyframe_paths,
                mouth_shapes,
                temp_path
            )
            
            # Upload synced keyframes to storage or return local paths
            # For now, return local paths (caller will handle upload)
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
                output_paths = []
                for idx, synced_path in enumerate(synced_keyframes):
                    output_path = os.path.join(output_dir, f"synced_{idx:04d}.png")
                    import shutil
                    shutil.copy(synced_path, output_path)
                    output_paths.append(output_path)
                return output_paths
            else:
                return synced_keyframes
    
    def _parse_rhubarb_dat(self, dat_file: Path) -> List[dict]:
        """
        Parse Rhubarb DAT file to extract mouth shape timings
        
        DAT format: time\tmouth_shape
        Mouth shapes: A, B, C, D, E, F, G, H, X (closed)
        
        Returns:
            List of dicts with 'time' and 'shape' keys
        """
        mouth_shapes = []
        
        try:
            with open(dat_file, "r") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    
                    parts = line.split("\t")
                    if len(parts) >= 2:
                        time = float(parts[0])
                        shape = parts[1].upper()
                        mouth_shapes.append({"time": time, "shape": shape})
            
            logger.info(f"Parsed {len(mouth_shapes)} mouth shape timings")
            return mouth_shapes
            
        except Exception as e:
            logger.error(f"Failed to parse Rhubarb DAT file: {e}")
            # Return empty list (no lip-sync)
            return []
    
    def _overlay_mouth_shapes(
        self,
        keyframe_paths: List[str],
        mouth_shapes: List[dict],
        temp_dir: Path
    ) -> List[str]:
        """
        Overlay mouth shapes on keyframes based on timing
        
        Args:
            keyframe_paths: List of keyframe image paths
            mouth_shapes: List of mouth shape timings from Rhubarb
            temp_dir: Temporary directory for output
            
        Returns:
            List of paths to keyframes with mouth shapes overlaid
        """
        # Simplified implementation: map mouth shapes to keyframes
        # In production, you'd use PIL/Pillow or FFmpeg to overlay mouth sprites
        
        # For now, return original keyframes (mouth overlay would require sprite assets)
        # This is a placeholder - in production, you'd:
        # 1. Load mouth shape sprites (A.png, B.png, etc.)
        # 2. Map mouth shapes to keyframes based on timing
        # 3. Overlay sprites on keyframes using PIL or FFmpeg
        
        logger.info("Mouth shape overlay (placeholder - requires sprite assets)")
        
        # Return original keyframes for now
        # TODO: Implement actual mouth sprite overlay
        return keyframe_paths


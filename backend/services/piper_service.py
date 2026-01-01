"""
Piper TTS Service for Free Text-to-Speech
Uses Piper (MIT) for local, offline TTS generation
"""
import os
import subprocess
import tempfile
import logging
from typing import Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class PiperService:
    """
    Service for generating TTS audio using Piper
    Supports local models from HuggingFace (rhasspy/piper-voices)
    """
    
    def __init__(self, piper_path: Optional[str] = None, model_path: Optional[str] = None):
        """
        Initialize Piper TTS service
        
        Args:
            piper_path: Path to piper executable (auto-detected if None)
            model_path: Path to Piper voice model (.onnx file)
                       Default: uses en_US-lessac-medium if available
        """
        self.piper_path = piper_path or self._find_piper()
        if not self.piper_path:
            raise RuntimeError("Piper not found. Please install Piper TTS and ensure it's in PATH.")
        
        # Default to en_US-lessac-medium if no model specified
        self.model_path = model_path or self._find_default_model()
        if not self.model_path:
            logger.warning("No Piper model found. TTS will fail. Download from: https://huggingface.co/rhasspy/piper-voices")
        
        logger.info(f"Piper service initialized: {self.piper_path}, model: {self.model_path}")
    
    def _find_piper(self) -> Optional[str]:
        """Find Piper executable in PATH"""
        import shutil
        return shutil.which("piper") or shutil.which("piper.exe")
    
    def _find_default_model(self) -> Optional[str]:
        """
        Find default Piper model
        Checks common locations: ~/.local/share/piper/voices, ./models/piper, etc.
        """
        # Common model locations
        possible_paths = [
            os.path.expanduser("~/.local/share/piper/voices/en_US-lessac-medium/en_US-lessac-medium.onnx"),
            os.path.expanduser("~/.local/share/piper/voices/en_US-lessac-medium/en_US-lessac-medium.onnx.json"),
            "./models/piper/en_US-lessac-medium.onnx",
            "./backend/models/piper/en_US-lessac-medium.onnx",
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                # Remove .json extension if present, keep .onnx
                if path.endswith(".json"):
                    onnx_path = path[:-5]  # Remove .json
                    if os.path.exists(onnx_path):
                        return onnx_path
                else:
                    return path
        
        return None
    
    def generate_tts(
        self,
        text: str,
        voice: str = "en_US-lessac-medium",
        output_path: Optional[str] = None,
        sample_rate: int = 22050
    ) -> str:
        """
        Generate TTS audio from text using Piper
        
        Args:
            text: Text to synthesize
            voice: Voice model name (default: en_US-lessac-medium)
            output_path: Output WAV file path (creates temp file if None)
            sample_rate: Audio sample rate (default 22050)
            
        Returns:
            output_path: Path to generated WAV file
            
        Raises:
            subprocess.CalledProcessError: If Piper fails
            RuntimeError: If model not found
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        if not self.model_path or not os.path.exists(self.model_path):
            raise RuntimeError(f"Piper model not found: {self.model_path}. Download from https://huggingface.co/rhasspy/piper-voices")
        
        # Set output path
        if output_path is None:
            output_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            output_path = output_file.name
            output_file.close()
        
        logger.info(f"Generating TTS for text: {text[:50]}...")
        
        # Build Piper command
        # Piper syntax: echo "text" | piper --model model.onnx --output_file output.wav
        cmd = [
            self.piper_path,
            "--model", self.model_path,
            "--output_file", output_path,
            "--sample-rate", str(sample_rate)
        ]
        
        try:
            # Run Piper with text input via stdin
            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate(input=text, timeout=60)
            
            if process.returncode != 0:
                logger.error(f"Piper TTS failed: {stderr}")
                raise RuntimeError(f"Piper TTS failed: {stderr}")
            
            if not os.path.exists(output_path):
                raise RuntimeError(f"Piper output file not created: {output_path}")
            
            logger.info(f"TTS audio generated: {output_path}")
            return output_path
            
        except subprocess.TimeoutExpired:
            logger.error("Piper TTS timed out")
            raise RuntimeError("TTS generation timed out after 60 seconds")
        except Exception as e:
            logger.error(f"Piper TTS error: {e}")
            raise
    
    def generate_tts_batch(
        self,
        texts: list[str],
        voice: str = "en_US-lessac-medium",
        output_dir: Optional[str] = None
    ) -> list[str]:
        """
        Generate TTS audio for multiple texts
        
        Args:
            texts: List of texts to synthesize
            voice: Voice model name
            output_dir: Output directory (creates temp dir if None)
            
        Returns:
            output_paths: List of paths to generated WAV files
        """
        if output_dir is None:
            output_dir = tempfile.mkdtemp()
        
        output_paths = []
        for idx, text in enumerate(texts):
            output_path = os.path.join(output_dir, f"tts_{idx:04d}.wav")
            path = self.generate_tts(text, voice, output_path)
            output_paths.append(path)
        
        return output_paths


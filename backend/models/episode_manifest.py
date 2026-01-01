"""
Episode Manifest Models
Data models for episode generation pipeline
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SceneOutput(BaseModel):
    """Output URLs for a scene"""
    keyframes_urls: Optional[List[str]] = Field(default=None, description="Generated keyframe URLs")
    animatic_url: Optional[str] = Field(default=None, description="Generated animatic video URL")
    motion_url: Optional[str] = Field(default=None, description="Generated motion clip URL (if motion_mode=wan_motion)")


class SceneSpec(BaseModel):
    """Specification for a single scene"""
    scene_id: str = Field(..., description="Scene ID")
    prompt: str = Field(..., description="Scene description prompt")
    dialogue: Optional[str] = Field(default=None, description="Optional dialogue line for this scene")
    keyframe_prompts: List[str] = Field(default_factory=list, description="List of prompts for keyframe generation")
    motion_mode: str = Field(default="animatic_only", description="Motion mode: 'animatic_only' or 'wan_motion'")
    duration_seconds: int = Field(..., ge=1, le=300, description="Target scene duration in seconds")
    keyframe_count: int = Field(default=12, ge=4, le=30, description="Number of keyframes to generate")
    hero: bool = Field(default=False, description="Whether this is a hero scene (forces wan_motion)")
    output: SceneOutput = Field(default_factory=SceneOutput, description="Generated output URLs")


class EpisodeManifest(BaseModel):
    """Complete episode manifest"""
    episode_id: str = Field(..., description="Episode ID")
    fps: int = Field(default=24, ge=12, le=60, description="Target FPS")
    width: int = Field(default=1280, ge=256, le=1920, description="Target width")
    height: int = Field(default=720, ge=256, le=1080, description="Target height")
    quality_preset: str = Field(default="standard", description="Quality preset: draft, standard, ultra_free")
    scenes: List[SceneSpec] = Field(..., min_items=1, description="List of scene specifications")
    transition: str = Field(default="cut", description="Transition type: cut or fade")
    voice_enabled: bool = Field(default=False, description="Whether to add voice track")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON storage"""
        return self.model_dump()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "EpisodeManifest":
        """Create from dictionary"""
        return cls(**data)


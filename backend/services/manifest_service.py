"""
Manifest Service
Builds episode manifests from user input with automatic motion selection
"""
import logging
from typing import List, Dict, Any
from backend.models.episode_manifest import EpisodeManifest, SceneSpec, SceneOutput

logger = logging.getLogger(__name__)


class ManifestService:
    """
    Service for building episode manifests with automatic quality presets and motion selection
    """
    
    # Motion action keywords (deterministic selection)
    MOTION_KEYWORDS = [
        "fight", "battle", "combat", "attack", "strike", "slash", "punch", "kick",
        "run", "running", "sprint", "chase", "pursuit",
        "jump", "leap", "dive", "fly", "soar",
        "explosion", "explode", "blast", "burst", "impact", "crash",
        "transform", "transformation", "morph", "change",
        "dodge", "evade", "deflect", "parry",
        "charge", "rush", "dash", "lunge"
    ]
    
    QUALITY_PRESETS = {
        "draft": {
            "width": 1280,
            "height": 720,
            "fps": 24,
            "motion_percentage_max": 10,
            "keyframe_count_default": 8
        },
        "standard": {
            "width": 1280,
            "height": 720,
            "fps": 24,
            "motion_percentage_max": 20,
            "keyframe_count_default": 12
        },
        "ultra_free": {
            "width": 1920,
            "height": 1080,
            "fps": 24,
            "motion_percentage_max": 30,
            "keyframe_count_default": 16
        }
    }
    
    def build_manifest(
        self,
        episode_id: str,
        scenes_input: List[Dict[str, Any]],
        quality_preset: str = "standard",
        transition: str = "cut",
        voice_enabled: bool = False
    ) -> EpisodeManifest:
        """
        Build episode manifest from user input
        
        Args:
            episode_id: Episode ID
            scenes_input: List of scene dictionaries with:
                - scene_id: str
                - prompt: str
                - dialogue: Optional[str]
                - hero: Optional[bool] (forces wan_motion)
                - duration_seconds: int
            quality_preset: Quality preset (draft, standard, ultra_free)
            transition: Transition type (cut or fade)
            voice_enabled: Whether to add voice track
            
        Returns:
            EpisodeManifest with motion modes automatically selected
        """
        if quality_preset not in self.QUALITY_PRESETS:
            raise ValueError(f"Unknown quality preset: {quality_preset}. Use: draft, standard, ultra_free")
        
        preset = self.QUALITY_PRESETS[quality_preset]
        
        # Build scene specs
        scene_specs = []
        for scene_input in scenes_input:
            scene_id = scene_input.get("scene_id")
            prompt = scene_input.get("prompt", "")
            dialogue = scene_input.get("dialogue")
            hero = scene_input.get("hero", False)
            duration_seconds = scene_input.get("duration_seconds", 10)
            keyframe_count = scene_input.get("keyframe_count", preset["keyframe_count_default"])
            
            if not scene_id:
                raise ValueError("Scene missing scene_id")
            if not prompt:
                raise ValueError(f"Scene {scene_id} missing prompt")
            
            # Determine motion mode
            motion_mode = self._select_motion_mode(prompt, hero)
            
            # Generate keyframe prompts from scene prompt
            # For v1, use the scene prompt as base and generate variations
            keyframe_prompts = self._generate_keyframe_prompts(prompt, keyframe_count)
            
            scene_spec = SceneSpec(
                scene_id=scene_id,
                prompt=prompt,
                dialogue=dialogue,
                keyframe_prompts=keyframe_prompts,
                motion_mode=motion_mode,
                duration_seconds=duration_seconds,
                keyframe_count=keyframe_count,
                hero=hero,
                output=SceneOutput()
            )
            
            scene_specs.append(scene_spec)
        
        # Validate motion percentage
        motion_scenes = [s for s in scene_specs if s.motion_mode == "wan_motion"]
        motion_percentage = (len(motion_scenes) / len(scene_specs)) * 100 if scene_specs else 0
        
        if motion_percentage > preset["motion_percentage_max"]:
            logger.warning(
                f"Motion percentage {motion_percentage:.1f}% exceeds preset max {preset['motion_percentage_max']}%. "
                f"Reducing motion scenes to meet cap."
            )
            # Reduce motion scenes to meet cap
            max_motion = int(len(scene_specs) * preset["motion_percentage_max"] / 100)
            motion_scenes_to_keep = motion_scenes[:max_motion]
            motion_scene_ids = {s.scene_id for s in motion_scenes_to_keep}
            
            for scene in scene_specs:
                if scene.motion_mode == "wan_motion" and scene.scene_id not in motion_scene_ids:
                    scene.motion_mode = "animatic_only"
                    logger.info(f"Changed scene {scene.scene_id} from wan_motion to animatic_only to meet cap")
        
        manifest = EpisodeManifest(
            episode_id=episode_id,
            fps=preset["fps"],
            width=preset["width"],
            height=preset["height"],
            quality_preset=quality_preset,
            scenes=scene_specs,
            transition=transition,
            voice_enabled=voice_enabled
        )
        
        logger.info(
            f"Built manifest for episode {episode_id}: {len(scene_specs)} scenes, "
            f"{len(motion_scenes)} motion ({motion_percentage:.1f}%), preset={quality_preset}"
        )
        
        return manifest
    
    def _select_motion_mode(self, prompt: str, hero: bool) -> str:
        """
        Select motion mode based on prompt and hero flag
        
        Args:
            prompt: Scene prompt text
            hero: Whether user marked scene as hero
            
        Returns:
            "wan_motion" or "animatic_only"
        """
        if hero:
            return "wan_motion"
        
        # Check for motion keywords (case-insensitive)
        prompt_lower = prompt.lower()
        for keyword in self.MOTION_KEYWORDS:
            if keyword in prompt_lower:
                return "wan_motion"
        
        return "animatic_only"
    
    def _generate_keyframe_prompts(self, base_prompt: str, count: int) -> List[str]:
        """
        Generate keyframe prompts from base scene prompt
        
        For v1, creates simple variations by adding timing/angle descriptors.
        In production, could use LLM to generate more diverse prompts.
        
        Args:
            base_prompt: Base scene prompt
            count: Number of keyframe prompts to generate
            
        Returns:
            List of keyframe prompts
        """
        if count <= 1:
            return [base_prompt]
        
        # Simple variation: add timing/angle descriptors
        variations = [
            f"{base_prompt}, opening shot",
            f"{base_prompt}, mid scene",
            f"{base_prompt}, wide angle",
            f"{base_prompt}, close up",
            f"{base_prompt}, dramatic angle",
            f"{base_prompt}, action moment",
            f"{base_prompt}, emotional moment",
            f"{base_prompt}, climax",
            f"{base_prompt}, closing shot",
            f"{base_prompt}, transition moment"
        ]
        
        # Cycle through variations if needed
        prompts = []
        for i in range(count):
            if i < len(variations):
                prompts.append(variations[i])
            else:
                # Reuse variations with index
                prompts.append(variations[i % len(variations)])
        
        return prompts[:count]


export type SceneId = string;
export type CharacterId = string;
export type BackgroundId = string;
export type EpisodeId = string;

export interface ScriptLine {
  character?: string; // e.g., "ASTA"
  text: string;
}

export interface SceneBlock {
  id: SceneId;
  title: string;             // "Scene 1 – Hage Church"
  location?: string;         // "Hage Church Interior"
  timeOfDay?: string;        // "Evening"
  lines: ScriptLine[];       // editable dialogue/description
  notes?: string;            // user notes for generation
  assignedCharacters: CharacterId[];
  assignedBackground?: BackgroundId;
  musicCue?: string;
}

export interface EpisodeScaffold {
  episodeId: EpisodeId;
  title: string;
  scenes: SceneBlock[];
  characters: CharacterId[];       // discovered in script
  backgrounds: BackgroundId[];     // discovered in script
  props?: string[];                // optional
}

export interface VoiceSettings {
  id: string;
  name: string;
  pitch: number;        // 0-100
  speed: number;        // 0-100
  emotion: string;      // "neutral", "happy", "sad", "angry", etc.
  previewUrl?: string;
}

export interface Character {
  id: CharacterId;
  name: string;
  description: string;
  voice?: VoiceSettings;
  assignedToEpisode?: EpisodeId;
}


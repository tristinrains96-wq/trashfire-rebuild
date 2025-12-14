import { create } from 'zustand';
import { SceneBlock, EpisodeScaffold, Character, VoiceSettings } from '@/types';

type Section =
  | 'script'
  | 'characters'
  | 'backgrounds'
  | 'voices'
  | 'scenes'
  | 'episode';

type Status = 'ready' | 'busy' | 'error';

interface ProjectMeta {
  title: string;
  episodeId: string;
  episodeNumber: number;
}

type WorkspaceState = {
  // Core section management
  activeSection: Section;
  setSection: (s: Section) => void;
  
  // Project metadata
  project: ProjectMeta;
  setProject: (project: Partial<ProjectMeta>) => void;
  
  // Status management
  status: Status;
  setStatus: (status: Status) => void;
  
  // Task progress for FAB
  taskProgress: number | null;
  setTaskProgress: (progress: number | null) => void;
  
  // Script and episode data
  currentScript: SceneBlock[];
  setCurrentScript: (script: SceneBlock[]) => void;
  updateSceneBlock: (sceneId: string, updates: Partial<SceneBlock>) => void;
  
  // Episode scaffold
  episodeScaffold: EpisodeScaffold | null;
  setEpisodeScaffold: (scaffold: EpisodeScaffold | null) => void;
  
  // Characters and voices
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  assignVoiceToCharacter: (characterId: string, voice: VoiceSettings) => void;
  
  // Section-specific state
  sectionStates: Record<Section, any>;
  setSectionState: (section: Section, state: any) => void;
};

const defaultProject: ProjectMeta = {
  title: 'Untitled Project',
  episodeId: 'ep_001',
  episodeNumber: 1
};

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  // Core section management
  activeSection: 'script',
  setSection: (s) => {
    try {
      set({ activeSection: s });
    } catch (error) {
      console.error('Error setting workspace section:', error);
    }
  },
  
  // Project metadata
  project: defaultProject,
  setProject: (project) => {
    set((state) => ({
      project: { ...state.project, ...project }
    }));
  },
  
  // Status management
  status: 'ready',
  setStatus: (status) => {
    set({ status });
  },
  
  // Task progress for FAB
  taskProgress: null,
  setTaskProgress: (progress) => {
    set({ taskProgress: progress });
  },
  
  // Script and episode data
  currentScript: [],
  setCurrentScript: (script) => {
    set({ currentScript: script });
  },
  updateSceneBlock: (sceneId, updates) => {
    set((state) => ({
      currentScript: state.currentScript.map(scene => 
        scene.id === sceneId ? { ...scene, ...updates } : scene
      )
    }));
  },
  
  // Episode scaffold
  episodeScaffold: null,
  setEpisodeScaffold: (scaffold) => {
    set({ episodeScaffold: scaffold });
  },
  
  // Characters and voices
  characters: [],
  setCharacters: (characters) => {
    set({ characters });
  },
  updateCharacter: (characterId, updates) => {
    set((state) => ({
      characters: state.characters.map(char => 
        char.id === characterId ? { ...char, ...updates } : char
      )
    }));
  },
  assignVoiceToCharacter: (characterId, voice) => {
    set((state) => ({
      characters: state.characters.map(char => 
        char.id === characterId ? { ...char, voice, assignedToEpisode: state.project.episodeId } : char
      )
    }));
  },
  
  // Section-specific state
  sectionStates: {
    script: {},
    characters: {},
    backgrounds: {},
    voices: {},
    scenes: {},
    episode: {}
  },
  setSectionState: (section, state) => {
    set((prev) => ({
      sectionStates: {
        ...prev.sectionStates,
        [section]: { ...prev.sectionStates[section], ...state }
      }
    }));
  }
}));

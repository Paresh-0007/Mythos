import { create } from 'zustand';

export interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  chapters: Chapter[];
  characters: Character[];
  worldElements: WorldElement[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  traits: string[];
  backstory: string;
  relationships: { characterId: string; relationship: string }[];
  avatar?: string;
}

export interface WorldElement {
  id: string;
  name: string;
  type: 'location' | 'organization' | 'magic-system' | 'culture' | 'technology';
  description: string;
  details: Record<string, any>;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  setCurrentProject: (project: Project | null) => void;
  addChapter: (projectId: string, chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChapter: (projectId: string, chapterId: string, updates: Partial<Chapter>) => void;
  addCharacter: (projectId: string, character: Omit<Character, 'id'>) => void;
  updateCharacter: (projectId: string, characterId: string, updates: Partial<Character>) => void;
  addWorldElement: (projectId: string, element: Omit<WorldElement, 'id'>) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [
    {
      id: '1',
      title: 'The Chronicles of Aethermoor',
      description: 'An epic fantasy tale of magic, politics, and ancient prophecies.',
      genre: 'Fantasy',
      collaborators: ['john@example.com', 'sarah@example.com'],
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-12-01'),
      wordCount: 45000,
      chapters: [
        {
          id: '1',
          title: 'The Awakening',
          content: 'In the mystical realm of Aethermoor, where magic flows like rivers through the land...',
          order: 1,
          wordCount: 2500,
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2023-11-28'),
        },
        {
          id: '2',
          title: 'The Council of Whispers',
          content: 'The ancient council convened beneath the glowing crystals of the Ethereal Chamber...',
          order: 2,
          wordCount: 3200,
          createdAt: new Date('2023-02-01'),
          updatedAt: new Date('2023-11-30'),
        }
      ],
      characters: [
        {
          id: '1',
          name: 'Lyralei Stormweaver',
          description: 'A young mage with the rare ability to control weather patterns.',
          traits: ['Determined', 'Compassionate', 'Quick-tempered'],
          backstory: 'Born during the Great Storm, Lyralei was found by the Stormweaver clan...',
          relationships: [
            { characterId: '2', relationship: 'Mentor' }
          ],
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lyralei',
        }
      ],
      worldElements: [
        {
          id: '1',
          name: 'Aethermoor',
          type: 'location',
          description: 'The mystical realm where magic and reality intertwine.',
          details: {
            climate: 'Varied, influenced by magical currents',
            population: '12 million',
            government: 'Council of Mages',
          }
        }
      ]
    }
  ],
  currentProject: null,

  addProject: (project) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [],
      characters: [],
      worldElements: [],
    };
    set((state) => ({
      projects: [...state.projects, newProject],
    }));
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    }));
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  addChapter: (projectId, chapter) => {
    const newChapter: Chapter = {
      ...chapter,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              chapters: [...p.chapters, newChapter],
              updatedAt: new Date(),
            }
          : p
      ),
    }));
  },

  updateChapter: (projectId, chapterId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              chapters: p.chapters.map((c) =>
                c.id === chapterId ? { ...c, ...updates, updatedAt: new Date() } : c
              ),
              updatedAt: new Date(),
            }
          : p
      ),
    }));
  },

  addCharacter: (projectId, character) => {
    const newCharacter: Character = {
      ...character,
      id: Date.now().toString(),
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              characters: [...p.characters, newCharacter],
              updatedAt: new Date(),
            }
          : p
      ),
    }));
  },

  updateCharacter: (projectId, characterId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              characters: p.characters.map((c) =>
                c.id === characterId ? { ...c, ...updates } : c
              ),
              updatedAt: new Date(),
            }
          : p
      ),
    }));
  },

  addWorldElement: (projectId, element) => {
    const newElement: WorldElement = {
      ...element,
      id: Date.now().toString(),
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              worldElements: [...p.worldElements, newElement],
              updatedAt: new Date(),
            }
          : p
      ),
    }));
  },
}));
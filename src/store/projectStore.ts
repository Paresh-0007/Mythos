import { create } from 'zustand';
import { useAuthStore } from './authStore';

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
  projectId: string;
}

export interface ChapterVersion {
  id: string;
  chapterId: string;
  version: number;
  title: string;
  content: string;
  wordCount: number;
  authorId: string;
  authorEmail: string;
  changeDescription: string | null;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  chapterId?: string;
  userId: string;
  userEmail: string;
  userName: string;
  message: string;
  messageType: 'text' | 'system' | 'edit-notification';
  createdAt: Date;
}

export interface ProjectShare {
  id: string;
  projectId: string;
  shareToken: string;
  shareUrl: string;
  accessType: 'read' | 'comment';
  createdBy: string;
  expiresAt?: Date;
  createdAt: Date;
  isExpired?: boolean;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  traits: string[];
  backstory: string;
  relationships: { characterId: string; relationship: string }[];
  avatar?: string;
  projectId: string;
}

export interface WorldElement {
  id: string;
  name: string;
  type: 'location' | 'organization' | 'magic-system' | 'culture' | 'technology';
  description: string;
  details: Record<string, any>;
  projectId: string;
}

// Helper function to make authenticated API calls
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { token } = useAuthStore.getState();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  
  return response.json();
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  // Project methods
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters' | 'worldElements'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  // Chapter methods
  addChapter: (projectId: string, chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => Promise<void>;
  updateChapter: (projectId: string, chapterId: string, updates: Partial<Chapter>) => Promise<void>;
  deleteChapter: (projectId: string, chapterId: string) => Promise<void>;
  
  // Character methods
  addCharacter: (projectId: string, character: Omit<Character, 'id' | 'projectId'>) => Promise<void>;
  updateCharacter: (projectId: string, characterId: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (projectId: string, characterId: string) => Promise<void>;
  
  // World element methods
  addWorldElement: (projectId: string, element: Omit<WorldElement, 'id' | 'projectId'>) => Promise<void>;
  updateWorldElement: (projectId: string, elementId: string, updates: Partial<WorldElement>) => Promise<void>;
  deleteWorldElement: (projectId: string, elementId: string) => Promise<void>;
  
  // Collaboration methods
  addCollaborator: (projectId: string, email: string) => Promise<void>;
  removeCollaborator: (projectId: string, email: string) => Promise<void>;
  
  // Version control methods
  getChapterVersions: (chapterId: string) => Promise<ChapterVersion[]>;
  getChapterVersion: (chapterId: string, versionId: string) => Promise<ChapterVersion>;
  restoreChapterVersion: (chapterId: string, versionId: string) => Promise<void>;
  
  // Chat methods
  getChatMessages: (projectId: string, chapterId?: string) => Promise<ChatMessage[]>;
  sendChatMessage: (projectId: string, message: string, chapterId?: string) => Promise<ChatMessage>;
  deleteChatMessage: (projectId: string, messageId: string) => Promise<void>;
  
  // Sharing methods
  createProjectShare: (projectId: string, accessType?: 'read' | 'comment', expiresIn?: number) => Promise<ProjectShare>;
  getProjectShares: (projectId: string) => Promise<ProjectShare[]>;
  deleteProjectShare: (projectId: string, shareId: string) => Promise<void>;
  getSharedProject: (shareToken: string) => Promise<{ project: Project; chapters: Chapter[]; accessType: string; isSharedView: boolean }>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  // Project methods
  fetchProjects: async () => {
    try {
      set({ loading: true, error: null });
      const projects = await fetchWithAuth('/projects');
      set({ projects, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProject: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const project = await fetchWithAuth(`/projects/${id}`);
      set({ currentProject: project, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addProject: async (projectData) => {
    try {
      set({ loading: true, error: null });
      const newProject = await fetchWithAuth('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      set((state) => ({
        projects: [...state.projects, newProject],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateProject: async (id: string, updates) => {
    try {
      set({ loading: true, error: null });
      const updatedProject = await fetchWithAuth(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? updatedProject : p
        ),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteProject: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await fetchWithAuth(`/projects/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  // Chapter methods
  addChapter: async (projectId: string, chapterData) => {
    try {
      set({ loading: true, error: null });
      const newChapter = await fetchWithAuth('/chapters', {
        method: 'POST',
        body: JSON.stringify({ ...chapterData, projectId }),
      });
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              chapters: [...state.currentProject.chapters, newChapter],
            }
          : null,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateChapter: async (projectId: string, chapterId: string, updates) => {
    try {
      set({ loading: true, error: null });
      const updatedChapter = await fetchWithAuth(`/chapters/${chapterId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              chapters: state.currentProject.chapters.map((c) =>
                c.id === chapterId ? updatedChapter : c
              ),
            }
          : null,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteChapter: async (projectId: string, chapterId: string) => {
    try {
      set({ loading: true, error: null });
      await fetchWithAuth(`/chapters/${chapterId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              chapters: state.currentProject.chapters.filter((c) => c.id !== chapterId),
            }
          : null,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Character methods
  addCharacter: async (projectId: string, characterData) => {
    try {
      set({ loading: true, error: null });
      const newCharacter = await fetchWithAuth('/characters', {
        method: 'POST',
        body: JSON.stringify({ ...characterData, projectId }),
      });
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              characters: [...state.currentProject.characters, newCharacter],
            }
          : null,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateCharacter: async (projectId: string, characterId: string, updates) => {
    try {
      set({ loading: true, error: null });
      const updatedCharacter = await fetchWithAuth(`/characters/${characterId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              characters: state.currentProject.characters.map((c) =>
                c.id === characterId ? updatedCharacter : c
              ),
            }
          : null,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteCharacter: async (projectId: string, characterId: string) => {
    try {
      set({ loading: true, error: null });
      await fetchWithAuth(`/characters/${characterId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              characters: state.currentProject.characters.filter((c) => c.id !== characterId),
            }
          : null,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // World element methods
  addWorldElement: async (projectId: string, elementData) => {
    try {
      set({ loading: true, error: null });
      const newElement = await fetchWithAuth('/world-elements', {
        method: 'POST',
        body: JSON.stringify({ ...elementData, projectId }),
      });
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              worldElements: [...state.currentProject.worldElements, newElement],
            }
          : null,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateWorldElement: async (projectId: string, elementId: string, updates) => {
    try {
      set({ loading: true, error: null });
      const updatedElement = await fetchWithAuth(`/world-elements/${elementId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              worldElements: state.currentProject.worldElements.map((e) =>
                e.id === elementId ? updatedElement : e
              ),
            }
          : null,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteWorldElement: async (projectId: string, elementId: string) => {
    try {
      set({ loading: true, error: null });
      await fetchWithAuth(`/world-elements/${elementId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              worldElements: state.currentProject.worldElements.filter((e) => e.id !== elementId),
            }
          : null,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Collaboration methods
  addCollaborator: async (projectId: string, email: string) => {
    try {
      set({ loading: true, error: null });
      const updatedProject = await fetchWithAuth(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({
          collaborators: [...(useProjectStore.getState().currentProject?.collaborators || []), email],
        }),
      });
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject: state.currentProject?.id === projectId ? updatedProject : state.currentProject,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  removeCollaborator: async (projectId: string, email: string) => {
    try {
      set({ loading: true, error: null });
      const currentCollaborators = useProjectStore.getState().currentProject?.collaborators || [];
      const updatedCollaborators = currentCollaborators.filter(collab => collab !== email);
      
      const updatedProject = await fetchWithAuth(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({
          collaborators: updatedCollaborators,
        }),
      });
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject: state.currentProject?.id === projectId ? updatedProject : state.currentProject,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Version control methods
  getChapterVersions: async (chapterId: string) => {
    try {
      set({ loading: true, error: null });
      const versions = await fetchWithAuth(`/chapters/${chapterId}/versions`);
      set({ loading: false });
      return versions;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getChapterVersion: async (chapterId: string, versionId: string) => {
    try {
      set({ loading: true, error: null });
      const version = await fetchWithAuth(`/chapters/${chapterId}/versions/${versionId}`);
      set({ loading: false });
      return version;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  restoreChapterVersion: async (chapterId: string, versionId: string) => {
    try {
      set({ loading: true, error: null });
      const restoredChapter = await fetchWithAuth(`/chapters/${chapterId}/restore/${versionId}`, {
        method: 'POST',
      });
      
      // Update the current project with the restored chapter
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              chapters: state.currentProject.chapters.map((c) =>
                c.id === chapterId ? restoredChapter : c
              ),
            }
          : null,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Chat methods
  getChatMessages: async (projectId: string, chapterId?: string) => {
    try {
      set({ loading: true, error: null });
      const url = chapterId 
        ? `/chat/${projectId}?chapterId=${chapterId}`
        : `/chat/${projectId}`;
      const messages = await fetchWithAuth(url);
      set({ loading: false });
      return messages;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  sendChatMessage: async (projectId: string, message: string, chapterId?: string) => {
    try {
      set({ loading: true, error: null });
      const newMessage = await fetchWithAuth(`/chat/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, chapterId }),
      });
      set({ loading: false });
      return newMessage;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteChatMessage: async (projectId: string, messageId: string) => {
    try {
      set({ loading: true, error: null });
      await fetchWithAuth(`/chat/${projectId}/${messageId}`, {
        method: 'DELETE',
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Sharing methods
  createProjectShare: async (projectId: string, accessType: 'read' | 'comment' = 'read', expiresIn?: number) => {
    try {
      set({ loading: true, error: null });
      const share = await fetchWithAuth(`/shares/${projectId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessType, expiresIn }),
      });
      set({ loading: false });
      return share;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getProjectShares: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      const shares = await fetchWithAuth(`/shares/${projectId}/shares`);
      set({ loading: false });
      return shares;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProjectShare: async (projectId: string, shareId: string) => {
    try {
      set({ loading: true, error: null });
      await fetchWithAuth(`/shares/${projectId}/shares/${shareId}`, {
        method: 'DELETE',
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getSharedProject: async (shareToken: string) => {
    try {
      set({ loading: true, error: null });
      const sharedData = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shares/shared/${shareToken}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch shared project');
          return res.json();
        });
      set({ loading: false });
      return sharedData;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
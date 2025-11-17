import type { AppState, Client, Post, Comment, SecurityEvent, ClientHealth } from './types';
import { generateMockData } from './mockData';

const STORAGE_KEY = 'post-farming-data';

export function loadAppState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        posts: parsed.posts.map((p: any) => ({
          ...p,
          scheduledDate: new Date(p.scheduledDate),
          createdAt: new Date(p.createdAt),
        })),
        comments: parsed.comments.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          replies: c.replies.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          })),
        })),
        securityEvents: parsed.securityEvents.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        })),
        clientHealth: parsed.clientHealth.map((h: any) => ({
          ...h,
          lastScan: new Date(h.lastScan),
          warnings: h.warnings.map((w: any) => ({
            ...w,
            timestamp: new Date(w.timestamp),
          })),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading app state:', error);
  }
  
  // Initialize with mock data if nothing stored
  return generateMockData();
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving app state:', error);
  }
}

export function getCurrentClient(state: AppState): Client | undefined {
  return state.clients.find(c => c.id === state.currentClientId);
}

export function updateClient(state: AppState, client: Client): AppState {
  const newState = {
    ...state,
    clients: state.clients.map(c => c.id === client.id ? { ...client } : c),
  };
  saveAppState(newState);
  return newState;
}

export function addClient(state: AppState, client: Client): AppState {
  const newState = {
    ...state,
    clients: [...state.clients, { ...client }],
  };
  saveAppState(newState);
  return newState;
}

export function deleteClient(state: AppState, clientId: string): AppState {
  const filteredClients = state.clients.filter(c => c.id !== clientId);
  const newState = {
    ...state,
    clients: filteredClients,
    currentClientId: state.currentClientId === clientId 
      ? (filteredClients[0]?.id || null)
      : state.currentClientId,
  };
  saveAppState(newState);
  return newState;
}

export function addPost(state: AppState, post: Post): AppState {
  const newState = {
    ...state,
    posts: [...state.posts, { ...post }],
  };
  saveAppState(newState);
  return newState;
}

export function updatePost(state: AppState, post: Post): AppState {
  const newState = {
    ...state,
    posts: state.posts.map(p => p.id === post.id ? { ...post } : p),
  };
  saveAppState(newState);
  return newState;
}

export function deletePost(state: AppState, postId: string): AppState {
  const newState = {
    ...state,
    posts: state.posts.filter(p => p.id !== postId),
  };
  saveAppState(newState);
  return newState;
}

export function addComment(state: AppState, comment: Comment): AppState {
  const newState = {
    ...state,
    comments: [...state.comments, { ...comment }],
  };
  saveAppState(newState);
  return newState;
}

export function switchClient(state: AppState, clientId: string): AppState {
  const newState = {
    ...state,
    currentClientId: clientId,
  };
  saveAppState(newState);
  return newState;
}

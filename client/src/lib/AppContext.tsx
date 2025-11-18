import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppState, Client, Post, Comment } from './types';
import { 
  loadAppState, 
  saveAppState, 
  getCurrentClient, 
  switchClient as switchClientInStorage, 
  addPost as addPostToStorage,
  updatePost as updatePostInStorage,
  deletePost as deletePostFromStorage,
  updateClient as updateClientInStorage, 
  addClient as addClientToStorage,
  deleteClient as deleteClientFromStorage,
  addReplyToComment as addReplyToCommentInStorage
} from './storage';

type Language = 'en' | 'ku' | 'ar';

interface AppContextType {
  state: AppState;
  currentClient: Client | undefined;
  language: Language;
  setLanguage: (language: Language) => void;
  switchClient: (clientId: string) => void;
  addPost: (post: Post) => void;
  updatePost: (post: Post) => void;
  deletePost: (postId: string) => void;
  updateClient: (client: Client) => void;
  addClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  addReplyToComment: (commentId: string, reply: { content: string; isAI?: boolean }) => void;
  refreshAnalytics: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadAppState());
  const [language, setLanguage] = useState<Language>(() => {
    // Load language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('app-language') as Language;
    return savedLanguage || 'en';
  });

  const currentClient = getCurrentClient(state);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const switchClient = (clientId: string) => {
    const newState = switchClientInStorage(state, clientId);
    setState(newState);
  };

  const addPost = (post: Post) => {
    const newState = addPostToStorage(state, post);
    setState(newState);
  };

  const updatePost = (post: Post) => {
    const newState = updatePostInStorage(state, post);
    setState(newState);
  };

  const deletePost = (postId: string) => {
    const newState = deletePostFromStorage(state, postId);
    setState(newState);
  };

  const updateClient = (client: Client) => {
    const newState = updateClientInStorage(state, client);
    setState(newState);
  };

  const addClient = (client: Client) => {
    const newState = addClientToStorage(state, client);
    setState(newState);
  };

  const deleteClient = (clientId: string) => {
    const newState = deleteClientFromStorage(state, clientId);
    setState(newState);
  };

  const addReplyToComment = (commentId: string, reply: { content: string; isAI?: boolean }) => {
    const newState = addReplyToCommentInStorage(state, commentId, reply);
    setState(newState);
  };

  const refreshAnalytics = () => {
    // Simulate analytics refresh with slight random variation
    const variation = () => Math.floor(Math.random() * 20) - 10;
    const newState = {
      ...state,
      analytics: {
        ...state.analytics,
        totalViews: Math.max(0, state.analytics.totalViews + variation()),
        totalLikes: Math.max(0, state.analytics.totalLikes + Math.floor(variation() / 5)),
      },
    };
    setState(newState);
    saveAppState(newState);
  };

  return (
    <AppContext.Provider value={{ state, currentClient, language, setLanguage, switchClient, addPost, updatePost, deletePost, updateClient, addClient, deleteClient, addReplyToComment, refreshAnalytics }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

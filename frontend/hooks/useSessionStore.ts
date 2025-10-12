import { create } from 'zustand';
import { sessionAPI } from '@/lib/api';

interface SessionState {
  sessions: any[];
  activeSession: string | null;
  loadSessions: () => Promise<void>;
  setActiveSession: (sessionId: string) => void;
  logout: (sessionId: string) => Promise<void>;
  updateSessionStatus: (sessionId: string, status: string) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeSession: null,
  loadSessions: async () => {
    try {
      const data = await sessionAPI.getSessions();
      if (data.success) {
        set({ sessions: data.sessions });
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  },
  setActiveSession: (sessionId: string) => {
    set({ activeSession: sessionId });
  },
  updateSessionStatus: (sessionId: string, status: string) => {
    set((s) => ({ sessions: s.sessions.map((ss: any) => ss.sessionId === sessionId ? { ...ss, status } : ss) }));
  },
  logout: async (sessionId: string) => {
    try {
      await sessionAPI.deleteSession(sessionId);
      get().loadSessions();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
}));
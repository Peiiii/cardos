import { create } from 'zustand';

interface NavigationState {
  targetPath: string | null;
  navigate: (path: string | null) => void;
}

export const navigationStore = create<NavigationState>((set) => ({
  targetPath: null,
  navigate: (path) => set({ targetPath: path }),
})); 
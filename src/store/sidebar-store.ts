import { create } from 'zustand';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  title: string;
  icon: LucideIcon;
  path: string;
  onClick?: () => void;
  position: 'top' | 'bottom';
  order: number;
}

interface SidebarState {
  topItems: NavItem[];
  bottomItems: NavItem[];
  registerItem: (item: NavItem) => void;
  unregisterItem: (id: string) => void;
}

export const sidebarStore = create<SidebarState>((set) => ({
  topItems: [],
  bottomItems: [],
  registerItem: (item) => set((state) => ({
    [item.position === 'top' ? 'topItems' : 'bottomItems']: [
      ...state[item.position === 'top' ? 'topItems' : 'bottomItems'],
      item
    ].sort((a, b) => a.order - b.order)
  })),
  unregisterItem: (id) => set((state) => ({
    topItems: state.topItems.filter(item => item.id !== id),
    bottomItems: state.bottomItems.filter(item => item.id !== id)
  }))
})); 
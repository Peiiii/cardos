import { create } from "zustand";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  title: string;
  icon: LucideIcon;
  path: string;
  onClick?: () => void;
  notSelectable?: boolean;
  position: "top" | "bottom";
  order: number;
}

interface SidebarState {
  topItems: NavItem[];
  bottomItems: NavItem[];
  registerItem: (item: NavItem) => string;
  unregisterItem: (id: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeItemKey?: string;
  setActiveItemKey: (activeItemKey: string) => void;
}
// 添加collapsed状态
export const sidebarStore = create<SidebarState>((set) => ({
  topItems: [],
  bottomItems: [],
  collapsed: false,
  activeItemKey: undefined,
  setActiveItemKey: (activeItemKey) => set({ activeItemKey }),
  setCollapsed: (collapsed) => set({ collapsed }),
  registerItem: (item) => {
    set((state) => ({
      [item.position === "top" ? "topItems" : "bottomItems"]: [
        ...state[item.position === "top" ? "topItems" : "bottomItems"],
        item,
      ].sort((a, b) => a.order - b.order),
    }));
    return item.id;
  },
  unregisterItem: (id) =>
    set((state) => ({
      topItems: state.topItems.filter((item) => item.id !== id),
      bottomItems: state.bottomItems.filter((item) => item.id !== id),
    })),
}));

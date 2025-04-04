import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/theme-store';
import { useSidebarStore } from '@/store/sidebar-store';
import { Plugin } from '@/shared/plugins/core/plugin';

export const themePlugin: Plugin = {
  id: 'theme',
  name: 'Theme Switcher',
  register: () => {
    const store = useSidebarStore.getState();
    const { mode } = useThemeStore.getState();
    
    // 底部导航项 - 主题切换
    store.registerItem({
      id: 'theme-switcher',
      title: '主题设置',
      icon: mode === 'dark' ? Moon : Sun,
      path: '/settings/theme',
      position: 'bottom',
      order: 1,
      onClick: () => {
        const { mode, setMode } = useThemeStore.getState();
        setMode(mode === 'dark' ? 'light' : 'dark');
      }
    });
  },
  unregister: () => {
    const store = useSidebarStore.getState();
    store.unregisterItem('theme-switcher');
  }
}; 
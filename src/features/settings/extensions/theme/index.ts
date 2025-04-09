import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/theme-store';
import { sidebarStore } from '@/store/sidebar-store';
import { ExtensionDefinition } from '@cardos/extension';

export const themeExtension: ExtensionDefinition = {
  manifest: {
    id: 'theme',
    name: 'Theme Switcher',
    description: 'Theme Switcher',
    version: '1.0.0',
    author: 'cardos',
  },
  activate: () => {
    const store = sidebarStore.getState();
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
  deactivate: () => {
    const store = sidebarStore.getState();
    store.unregisterItem('theme-switcher');
  }
}; 
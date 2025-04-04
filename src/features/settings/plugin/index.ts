import { Settings } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';
import { Plugin } from '@/shared/plugins/core/plugin';
import { themePlugin } from './theme';

export const settingsPlugin: Plugin = {
  id: 'settings',
  name: 'Settings Navigation Item',
  children: [themePlugin],
  register: () => {
    const store = useSidebarStore.getState();
    
    // 设置
    store.registerItem({
      id: 'settings',
      title: '设置',
      icon: Settings,
      path: '/settings',
      position: 'top',
      order: 3
    });
  },
  unregister: () => {
    const store = useSidebarStore.getState();
    store.unregisterItem('settings');
  }
}; 
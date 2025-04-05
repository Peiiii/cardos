import { Settings } from 'lucide-react';
import { sidebarStore } from '@/store/sidebar-store';
import { Plugin } from '@/shared/plugins/core/plugin';
import { themePlugin } from './theme';
import { navigationStore } from '@/store/navigation-store';

export const settingsPlugin: Plugin = {
  id: 'settings',
  name: 'Settings Navigation Item',
  children: [themePlugin],
  register: () => {
    const store = sidebarStore.getState();
    const { navigate } = navigationStore.getState();
    
    // 设置
    store.registerItem({
      id: 'settings',
      title: '设置',
      icon: Settings,
      path: '/settings',
      position: 'top',
      order: 3,
      onClick: () => navigate('/settings')
    });
  },
  unregister: () => {
    const store = sidebarStore.getState();
    store.unregisterItem('settings');
  }
}; 
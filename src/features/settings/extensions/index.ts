import { themeExtension } from '@/features/settings/extensions/theme';
import { navigationStore } from '@/store/navigation-store';
import { sidebarStore } from '@/store/sidebar-store';
import { ExtensionDefinition } from '@cardos/extension';
import { Settings } from 'lucide-react';

export const settingsExtension: ExtensionDefinition = {
  manifest: {
    id: 'settings',
    name: 'Settings Navigation Item',
    description: 'Settings Navigation Item',
    version: '1.0.0',
    author: 'cardos',
  },
  activate: () => {
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
  deactivate: () => {
    const store = sidebarStore.getState();
    store.unregisterItem('settings');
  }
}; 


export const getSettingsExtensions = () => {
  return [settingsExtension, themeExtension];
};
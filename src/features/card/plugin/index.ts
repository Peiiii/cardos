import { FileText, CreditCard } from 'lucide-react';
import { sidebarStore } from '@/store/sidebar-store';
import { navigationStore } from '@/store/navigation-store';
import { Plugin } from '@/shared/plugins/core/plugin';

export const cardPlugin: Plugin = {
  id: 'card',
  name: 'Card Navigation Items',
  register: () => {
    const store = sidebarStore.getState();
    const { navigate } = navigationStore.getState();
    
    // 我的卡片
    store.registerItem({
      id: 'my-cards',
      title: '我的卡片',
      icon: FileText,
      path: '/my-cards',
      position: 'top',
      order: 1,
      onClick: () => navigate('/my-cards')
    });
    
    // 创建卡片
    store.registerItem({
      id: 'create-card',
      title: '创建卡片',
      icon: CreditCard,
      path: '/create',
      position: 'top',
      order: 2,
      onClick: () => navigate('/create')
    });
  },
  unregister: () => {
    const store = sidebarStore.getState();
    ['my-cards', 'create-card'].forEach(id => {
      store.unregisterItem(id);
    });
  }
}; 
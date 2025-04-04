import { MessageSquare, Plus } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';
import { useNavigationStore } from '@/store/navigation-store';
import { Plugin } from '@/shared/plugins/core/plugin';

export const chatPlugin: Plugin = {
  id: 'chat',
  name: 'Chat Navigation Items',
  register: () => {
    const store = useSidebarStore.getState();
    const { navigate } = useNavigationStore.getState();
    
    // 历史对话
    store.registerItem({
      id: 'history',
      title: '历史对话',
      icon: MessageSquare,
      path: '/home',
      position: 'top',
      order: 1,
      onClick: () => navigate('/home')
    });
    
    // 新建对话
    store.registerItem({
      id: 'new-chat',
      title: '新建对话',
      icon: Plus,
      path: '/chat',
      position: 'top',
      order: 2,
      onClick: () => navigate('/chat')
    });
  },
  unregister: () => {
    const store = useSidebarStore.getState();
    ['history', 'new-chat'].forEach(id => {
      store.unregisterItem(id);
    });
  }
}; 
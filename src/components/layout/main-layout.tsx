import { useState } from 'react';
import { useResponsive } from '@/hooks/use-responsive';
import { Outlet, useNavigate } from 'react-router-dom';

// 桌面端组件
import { DesktopLayout } from './desktop/desktop-layout';
import { Sidebar as DesktopSidebar } from './desktop/sidebar';

// 移动端组件
import { MobileLayout } from './mobile/mobile-layout';
import { Drawer as MobileDrawer } from './mobile/drawer';

import { ConversationItem } from '../chat/conversation-item';

// 示例对话数据
const exampleConversations = [
  { id: '1', title: '如何烹饪意大利面', timestamp: '今天 10:30' },
  { id: '2', title: '学习React的最佳实践', timestamp: '昨天 15:45' },
  { id: '3', title: '旅行计划指南', timestamp: '3天前' },
];

export function MainLayout() {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  
  // 当前活跃的对话
  const [activeConversation, setActiveConversation] = useState(exampleConversations[0]);
  
  // 移动端抽屉状态
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // 切换对话
  const handleSelectConversation = (conversation: typeof exampleConversations[0]) => {
    setActiveConversation(conversation);
    navigate(`/chat/${conversation.id}`);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  // 导航处理函数
  const handleHistoryClick = () => {
    navigate('/home');
  };

  // 处理新建对话
  const handleNewChat = () => {
    navigate('/chat');
  };
  
  // 设置页面导航
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // 移动端布局
  if (isMobile) {
    return (
      <MobileLayout>
        <MobileDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onHistoryClick={handleHistoryClick}
          onNewChatClick={handleNewChat}
          onSettingsClick={handleSettingsClick}
        >
          {exampleConversations.map(conv => (
            <ConversationItem 
              key={conv.id}
              title={conv.title}
              timestamp={conv.timestamp}
              isActive={conv.id === activeConversation.id}
              onClick={() => handleSelectConversation(conv)}
            />
          ))}
        </MobileDrawer>
        
        {/* 主内容区域 */}
        <div className="h-full w-full overflow-auto">
          <Outlet />
        </div>
      </MobileLayout>
    );
  }

  // 桌面端布局
  return (
    <DesktopLayout>
      <DesktopSidebar
        onHistoryClick={handleHistoryClick}
        onNewChatClick={handleNewChat}
        onSettingsClick={handleSettingsClick}
      >
        {exampleConversations.map(conv => (
          <ConversationItem 
            key={conv.id}
            title={conv.title}
            timestamp={conv.timestamp}
            isActive={conv.id === activeConversation.id}
            onClick={() => handleSelectConversation(conv)}
          />
        ))}
      </DesktopSidebar>
      
      {/* 主内容区域 */}
      <div className="flex-1 h-full overflow-auto">
        <Outlet />
      </div>
    </DesktopLayout>
  );
}
 
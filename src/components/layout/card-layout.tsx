import { useState } from 'react';
import { useResponsive } from '@/hooks/use-responsive';
import { Button } from '@/components/ui/button';
import { Outlet, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

// 桌面端组件
import { DesktopLayout } from './desktop/desktop-layout';
import { Sidebar as DesktopSidebar } from './desktop/sidebar';

// 移动端组件
import { MobileLayout } from './mobile/mobile-layout';
import { Drawer as MobileDrawer } from './mobile/drawer';

import { ConversationItem } from '../chat/conversation-item';

// 示例对话数据 - 在实际应用中应从状态管理库或API获取
const exampleConversations = [
  { id: '1', title: '如何烹饪意大利面', timestamp: '今天 10:30' },
  { id: '2', title: '学习React的最佳实践', timestamp: '昨天 15:45' },
  { id: '3', title: '旅行计划指南', timestamp: '3天前' },
];

export function CardLayout() {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  
  // 当前活跃的对话
  const [activeConversation, setActiveConversation] = useState(exampleConversations[0]);
  
  // 移动端抽屉状态
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // 切换对话
  const handleSelectConversation = (conversation: typeof exampleConversations[0]) => {
    setActiveConversation(conversation);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  // 处理新建对话
  const handleNewChat = () => {
    // 模拟新建对话
    alert('新建对话');
  };

  // 返回聊天界面
  const handleBackToChat = () => {
    navigate('/chat');
  };

  // 移动端布局
  if (isMobile) {
    return (
      <MobileLayout>
        <MobileDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onNewChatClick={handleNewChat}
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
        
        {/* 返回按钮 */}
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToChat}
            className="bg-white/80 backdrop-blur-sm shadow-sm"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* 渲染子路由内容 - 卡片详情 */}
        <div className="p-0 pt-14 h-full w-full">
          <Outlet />
        </div>
      </MobileLayout>
    );
  }

  // 桌面端布局 - 不包含右侧卡片预览区域
  return (
    <DesktopLayout>
      <DesktopSidebar
        onNewChatClick={handleNewChat}
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
      
      {/* 卡片详情占据剩余全部空间 */}
      <div className="flex-1 h-full overflow-auto">
        <Outlet />
      </div>
    </DesktopLayout>
  );
} 
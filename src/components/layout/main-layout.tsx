import { useState } from 'react';
import { useResponsive } from '@/hooks/use-responsive';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Settings } from 'lucide-react';

// 桌面端组件
import { DesktopLayout } from './desktop/desktop-layout';
import { Sidebar as DesktopSidebar } from './desktop/sidebar';

// 移动端组件
import { MobileLayout } from './mobile/mobile-layout';

import { ConversationItem } from '../chat/conversation-item';
import { exampleConversations } from '@/mock/chat-data';

export function MainLayout() {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  
  // 当前活跃的对话
  const [activeConversation, setActiveConversation] = useState(exampleConversations[0]);
  
  // 切换对话
  const handleSelectConversation = (conversation: typeof exampleConversations[0]) => {
    setActiveConversation(conversation);
    navigate(`/chat/${conversation.id}`);
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
      <MobileLayout
        title="CardOS"
        drawer={
          <div className="flex flex-col h-full">
            {/* Logo 和品牌 */}
            <div className="flex items-center justify-center py-4 border-b border-border">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                CardOS
              </h1>
            </div>
            
            {/* 导航菜单 */}
            <div className="flex flex-col gap-2 p-4">
              <Button 
                variant="ghost"
                className="justify-start text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                onClick={handleHistoryClick}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                历史对话
              </Button>
              <Button 
                variant="ghost"
                className="justify-start text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-medium"
                onClick={handleNewChat}
              >
                <Plus className="h-4 w-4 mr-2" />
                新建对话
              </Button>
              <Button 
                variant="ghost"
                className="justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                onClick={handleSettingsClick}
              >
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Button>
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-border" />

            {/* 对话列表 */}
            <div className="flex-1 overflow-auto">
              {exampleConversations.map(conv => (
                <ConversationItem 
                  key={conv.id}
                  title={conv.title}
                  timestamp={conv.timestamp}
                  isActive={conv.id === activeConversation.id}
                  onClick={() => handleSelectConversation(conv)}
                />
              ))}
            </div>
          </div>
        }
      >
        <Outlet />
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
 
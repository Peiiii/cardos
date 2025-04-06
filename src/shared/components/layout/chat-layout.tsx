import { useResponsive } from "@/shared/hooks/use-responsive";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from '@/features/card/types/card';

// 桌面端组件
import { CardPreview as DesktopCardPreview } from "./desktop/card-preview";
import { DesktopLayout } from "./desktop/desktop-layout";
import { Sidebar as DesktopSidebar } from "./desktop/sidebar";

// 移动端组件
import { MobileLayout } from "./mobile/mobile-layout";
import { SidebarNav } from "./sidebar/sidebar-nav";

import { CardPreviewItem } from "@/features/card/components/card-preview-item";
import { ConversationItem } from "@/features/chat/components/conversation-item";

import { initialCard } from "@/mock/chat-data";
import { useCards } from '@/features/card/hooks';
import { useConversations } from '@/features/chat/hooks/use-conversations';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { data: cards } = useCards(conversationId || '');
  
  const {
    conversations,
    selectedConversation,
    selectConversation
  } = useConversations();

  // 当前卡片 ID
  const [currentCardId] = useState<string>(initialCard.id);

  // 获取当前卡片数据
  const currentCard = cards?.find((card: Card) => card.id === currentCardId) || initialCard;

  // 切换对话
  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
    navigate(`/chat/${conversationId}`);
  };

  // 移动端布局
  if (isMobile) {
    return (
      <MobileLayout
        title={selectedConversation?.title || '新对话'}
        drawer={
          <div className="flex flex-col h-full">
            {/* Logo 和品牌 */}
            <div className="flex items-center justify-between py-4 px-4 border-b border-border">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                CardOS
              </h1>
            </div>

            {/* 导航菜单 */}
            <SidebarNav isCollapsed={false} />

            {/* 分隔线 */}
            <div className="h-px bg-border" />

            {/* 对话列表 */}
            <div className="flex-1 overflow-auto">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  title={conversation.title}
                  timestamp={conversation.timestamp}
                  isActive={conversation.id === selectedConversation?.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                />
              ))}
            </div>
          </div>
        }
      >
        {children}
      </MobileLayout>
    );
  }

  // 桌面端布局
  return (
    <DesktopLayout>
      <DesktopSidebar>
        {/* 对话列表 */}
        <div className="flex-1 overflow-auto">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              title={conversation.title}
              timestamp={conversation.timestamp}
              isActive={conversation.id === selectedConversation?.id}
              onClick={() => handleSelectConversation(conversation.id)}
            />
          ))}
        </div>
      </DesktopSidebar>
      
      {/* 聊天区域 */}
      <div className="flex-1 h-full overflow-auto">
        {children}
      </div>
      
      {/* 卡片预览 */}
      <DesktopCardPreview>
        <CardPreviewItem
          title={currentCard.title}
          content={currentCard.content}
          timestamp={currentCard.timestamp}
        />
      </DesktopCardPreview>
    </DesktopLayout>
  );
}

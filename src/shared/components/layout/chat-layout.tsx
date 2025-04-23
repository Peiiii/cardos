import { useResponsive } from "@/shared/hooks/use-responsive";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from '@/features/card/types/card';

// 桌面端组件
import { CardPreview as DesktopCardPreview } from "./desktop/card-preview";
import { DesktopLayout } from "./desktop/desktop-layout";
import { Sidebar as DesktopSidebar } from "./desktop/sidebar";

// 移动端组件
import { MobileLayout } from "./mobile/mobile-layout";
import { SidebarContent } from "./shared/sidebar-content";
import { ConversationList } from "./shared/conversation-list";

import { CardPreviewItem } from "@/features/card/components/card-preview-item";
import { initialCard } from "@/shared/mock/chat-data";
import { useCards } from '@/features/card/hooks';
import { useConversations } from '@/features/chat/hooks/use-conversations';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const { isMobile } = useResponsive();
  const { conversationId } = useParams();
  const { data: cards } = useCards(conversationId || '');
  const { selectedConversation } = useConversations();
  
  // 当前卡片 ID
  const [currentCardId] = useState<string>(initialCard.id);

  // 获取当前卡片数据
  const currentCard = cards?.find((card: Card) => card.id === currentCardId) || initialCard;

  // 移动端布局
  if (isMobile) {
    return (
      <MobileLayout
        title={selectedConversation?.title || '新对话'}
        drawer={
          <SidebarContent title="CardOS">
            <ConversationList />
          </SidebarContent>
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
        <ConversationList />
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

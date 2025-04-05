import { Button } from "@/shared/components/ui/button";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

// 桌面端组件
import { CardPreview as DesktopCardPreview } from "./desktop/card-preview";
import { ChatArea as DesktopChatArea } from "./desktop/chat-area";
import { DesktopLayout } from "./desktop/desktop-layout";
import { Sidebar as DesktopSidebar } from "./desktop/sidebar";

// 移动端组件
import { MobileLayout } from "./mobile/mobile-layout";
import { SidebarNav } from "./sidebar/sidebar-nav";

import { CardPreviewItem } from "@/features/card/components/card-preview-item";
import { ConversationItem } from "@/features/chat/components/conversation-item";

// 导入 mock 数据
import {
  exampleConversations,
  initialCard,
  initialMessages,
} from "@/mock/chat-data";

export function ChatLayout() {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  // 当前活跃的对话
  const [activeConversation, setActiveConversation] = useState(
    exampleConversations[0]
  );

  // 消息列表
  const [messages, setMessages] = useState(initialMessages);

  // 当前卡片
  const [currentCard, setCurrentCard] = useState(initialCard);

  // 添加新消息
  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: String(Date.now()),
      content,
      isUser: true,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = {
        id: String(Date.now() + 1),
        content:
          "我了解了。对于意大利面，你可以尝试以下几种经典酱汁：\n\n1. 番茄酱汁 - 最基础简单的选择\n2. 白酱 - 奶油口感，适合搭配海鲜\n3. 青酱 - 由罗勒、橄榄油和松子制成，清新可口\n\n初学者我建议先尝试番茄酱汁，简单易做且味道经典。",
        isUser: false,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiResponse]);

      // 更新卡片
      setCurrentCard({
        id: String(Date.now() + 2),
        title: "三种经典意面酱汁",
        content:
          "以下是三种最受欢迎的意大利面酱汁制作方法：\n\n1. 番茄酱汁：\n   - 橄榄油热锅，炒香蒜末\n   - 加入番茄酱或切碎的番茄\n   - 加盐、黑胡椒和香草调味\n   - 小火煮10-15分钟\n\n2. 白酱（奶油酱）：\n   - 锅中融化黄油\n   - 加入面粉，炒香但不要变色\n   - 慢慢加入牛奶，不断搅拌直至浓稠\n   - 加入帕玛森奶酪和调味料\n\n3. 青酱（罗勒酱）：\n   - 将新鲜罗勒叶、松子、大蒜放入搅拌机\n   - 加入橄榄油和帕玛森奶酪\n   - 搅拌至细腻，调整口味\n\n初学者推荐尝试番茄酱汁，因为原料简单且步骤直观，几乎不会失败。",
        timestamp: Date.now(),
      });
    }, 1000);
  };

  // 切换对话
  const handleSelectConversation = (
    conversation: (typeof exampleConversations)[0]
  ) => {
    setActiveConversation(conversation);
    navigate(`/chat/${conversation.id}`);
  };

  // 移动端布局
  if (isMobile) {
    return (
      <MobileLayout
        title={activeConversation.title}
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
              {exampleConversations.map((conv) => (
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
        {/* 渲染子路由内容 */}
        <Outlet
          context={{
            messages,
            currentCard,
            handleSendMessage,
            setCurrentCard,
          }}
        />

        {/* 添加查看卡片按钮 */}
        <div className="fixed bottom-20 right-4 z-10">
          <Button
            className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            onClick={() => navigate(`/card/${currentCard.id}`)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </Button>
        </div>
      </MobileLayout>
    );
  }

  // 桌面端布局
  return (
    <DesktopLayout>
      <DesktopSidebar>
        {exampleConversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            title={conv.title}
            timestamp={conv.timestamp}
            isActive={conv.id === activeConversation.id}
            onClick={() => handleSelectConversation(conv)}
          />
        ))}
      </DesktopSidebar>

      <DesktopChatArea onSendMessage={handleSendMessage}>
        {/* 渲染子路由的内容 */}
        <Outlet
          context={{
            messages,
            currentCard,
            handleSendMessage,
            setCurrentCard,
          }}
        />
      </DesktopChatArea>

      {/* 显示卡片预览 */}
      <DesktopCardPreview>
        <CardPreviewItem
          title={currentCard.title}
          content={currentCard.content}
          timestamp={currentCard.timestamp}
          onShare={() => alert("已复制分享链接！")}
          onExport={() => alert("已导出为PDF！")}
          onCopy={() => alert("已复制内容到剪贴板！")}
        />
      </DesktopCardPreview>
    </DesktopLayout>
  );
}

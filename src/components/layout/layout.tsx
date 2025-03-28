import { useState } from 'react';
import { useResponsive } from '@/hooks/use-responsive';
import { Button } from '@/components/ui/button';
import { Outlet, useNavigate } from 'react-router-dom';

// 桌面端组件
import { DesktopLayout } from './desktop/desktop-layout';
import { Sidebar as DesktopSidebar } from './desktop/sidebar';
import { ChatArea as DesktopChatArea } from './desktop/chat-area';
import { CardPreview as DesktopCardPreview } from './desktop/card-preview';

// 移动端组件
import { MobileLayout } from './mobile/mobile-layout';
import { Drawer as MobileDrawer } from './mobile/drawer';

import { ConversationItem } from '../chat/conversation-item';
import { CardPreviewItem } from '../card/card-preview-item';

// 示例数据
const exampleConversations = [
  { id: '1', title: '如何烹饪意大利面', timestamp: '今天 10:30' },
  { id: '2', title: '学习React的最佳实践', timestamp: '昨天 15:45' },
  { id: '3', title: '旅行计划指南', timestamp: '3天前' },
];

// 初始消息
const initialMessages = [
  { id: '1', content: '你好，我想知道如何制作简单的意大利面。', isUser: true, timestamp: '10:30' },
  { id: '2', content: '当然可以帮你！意大利面的基本步骤很简单：\n\n1. 烧一锅水，水开后加盐\n2. 放入意大利面，按照包装上的时间煮\n3. 同时准备酱汁\n4. 面煮好后沥干水分\n5. 拌入酱汁即可', isUser: false, timestamp: '10:31' },
  { id: '3', content: '我应该用什么样的酱汁呢？', isUser: true, timestamp: '10:32' },
];

// 初始卡片
const initialCard = { 
  id: '1', 
  title: '意大利面基础食谱', 
  content: '意大利面是一种简单美味的主食，你可以按照以下步骤准备：\n\n- 烧开水并加盐\n- 放入意大利面烹煮8-10分钟\n- 准备酱汁（番茄酱汁、白酱或青酱）\n- 沥干面条\n- 加入酱汁拌匀\n- 撒上帕玛森奶酪和香草点缀\n\n小贴士：\n- 加入适量的盐使意大利面更有味道\n- 煮面的水量要足够，一般是面量的10倍\n- 面条稍硬（al dente）的口感最佳\n- 可以留一些面汤，帮助酱汁更好地融合', 
  timestamp: '10:31' 
};

interface LayoutProps {
  /**
   * 是否显示卡片预览区域
   * @default true
   */
  showCardPreview?: boolean;
}

/**
 * 通用布局组件
 * 可以通过props控制是否显示卡片预览区域
 */
export function Layout({ showCardPreview = true }: LayoutProps) {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  
  // 当前活跃的对话
  const [activeConversation, setActiveConversation] = useState(exampleConversations[0]);
  
  // 消息列表
  const [messages, setMessages] = useState(initialMessages);
  
  // 当前卡片
  const [currentCard, setCurrentCard] = useState(initialCard);
  
  // 移动端抽屉状态
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // 添加新消息
  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: String(Date.now()),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = {
        id: String(Date.now() + 1),
        content: '我了解了。对于意大利面，你可以尝试以下几种经典酱汁：\n\n1. 番茄酱汁 - 最基础简单的选择\n2. 白酱 - 奶油口感，适合搭配海鲜\n3. 青酱 - 由罗勒、橄榄油和松子制成，清新可口\n\n初学者我建议先尝试番茄酱汁，简单易做且味道经典。',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // 更新卡片
      setCurrentCard({
        id: String(Date.now() + 2),
        title: '三种经典意面酱汁',
        content: '以下是三种最受欢迎的意大利面酱汁制作方法：\n\n1. 番茄酱汁：\n   - 橄榄油热锅，炒香蒜末\n   - 加入番茄酱或切碎的番茄\n   - 加盐、黑胡椒和香草调味\n   - 小火煮10-15分钟\n\n2. 白酱（奶油酱）：\n   - 锅中融化黄油\n   - 加入面粉，炒香但不要变色\n   - 慢慢加入牛奶，不断搅拌直至浓稠\n   - 加入帕玛森奶酪和调味料\n\n3. 青酱（罗勒酱）：\n   - 将新鲜罗勒叶、松子、大蒜放入搅拌机\n   - 加入橄榄油和帕玛森奶酪\n   - 搅拌至细腻，调整口味\n\n初学者推荐尝试番茄酱汁，因为原料简单且步骤直观，几乎不会失败。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 1000);
  };
  
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

  // 处理查看卡片预览
  const handleViewCard = () => {
    navigate(`/card/${currentCard.id}`);
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
        
        {/* 渲染子路由内容 */}
        <Outlet context={{ 
          messages, 
          currentCard, 
          handleSendMessage,
          setCurrentCard
        }} />
        
        {/* 添加查看卡片按钮 - 只在显示卡片预览时显示 */}
        {showCardPreview && (
          <div className="fixed bottom-20 right-4 z-10">
            <Button 
              className="rounded-full h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
              onClick={handleViewCard}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </Button>
          </div>
        )}
      </MobileLayout>
    );
  }

  // 桌面端布局
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
      
      <DesktopChatArea onSendMessage={handleSendMessage}>
        {/* 渲染子路由的内容 */}
        <Outlet context={{ 
          messages, 
          currentCard, 
          handleSendMessage,
          setCurrentCard
        }} />
      </DesktopChatArea>
      
      {/* 只在显示卡片预览时显示 */}
      {showCardPreview && (
        <DesktopCardPreview>
          <CardPreviewItem
            title={currentCard.title}
            content={currentCard.content}
            timestamp={currentCard.timestamp}
            onShare={() => alert('已复制分享链接！')}
            onExport={() => alert('已导出为PDF！')}
            onCopy={() => alert('已复制内容到剪贴板！')}
          />
        </DesktopCardPreview>
      )}
    </DesktopLayout>
  );
} 
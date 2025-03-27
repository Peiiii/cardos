import { useState } from 'react';
import { MainLayout } from './main-layout';
import { Sidebar } from './sidebar';
import { ChatArea } from './chat-area';
import { CardPreview } from './card-preview';
import { ConversationItem } from '../chat/conversation-item';
import { Message } from '../chat/message';
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

export function Layout() {
  // 当前活跃的对话
  const [activeConversation, setActiveConversation] = useState(exampleConversations[0]);
  
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
  };

  // 处理新建对话
  const handleNewChat = () => {
    // 模拟新建对话
    alert('新建对话');
  };

  return (
    <MainLayout>
      <Sidebar
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
      </Sidebar>
      <ChatArea onSendMessage={handleSendMessage}>
        {messages.map(msg => (
          <Message 
            key={msg.id}
            content={msg.content}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
      </ChatArea>
      <CardPreview>
        <CardPreviewItem
          title={currentCard.title}
          content={currentCard.content}
          timestamp={currentCard.timestamp}
          onShare={() => alert('已复制分享链接！')}
          onExport={() => alert('已导出为PDF！')}
          onCopy={() => alert('已复制内容到剪贴板！')}
        />
      </CardPreview>
    </MainLayout>
  );
} 
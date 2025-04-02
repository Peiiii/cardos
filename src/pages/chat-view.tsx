import { Message } from '@/components/chat/message';
import { MessageInput } from '@/components/chat/message-input';
import { MessageList } from '@/components/chat/message-list';
import { useResponsive } from '@/hooks/use-responsive';
import { useOutletContext } from 'react-router-dom';

type ContextType = { 
  messages: Array<{ id: string; content: string; isUser: boolean; timestamp: number }>;
  handleSendMessage: (content: string) => void;
};

export default function ChatView() {
  const { messages, handleSendMessage } = useOutletContext<ContextType>();
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full bg-background">
        {/* 消息列表 - 填充剩余空间 */}
        <div className="flex-1 overflow-hidden relative">
          <MessageList className="absolute inset-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-background">
            {messages.map(msg => (
              <Message 
                key={msg.id}
                content={msg.content}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
              />
            ))}
          </MessageList>
        </div>

        {/* 输入区域 - 固定在底部 */}
        <div className="flex-shrink-0 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <MessageInput 
            onSend={handleSendMessage} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background scrollbar-thin scrollbar-thumb-muted scrollbar-track-background">
      <div className="max-w-3xl mx-auto">
        {messages.map(msg => (
          <Message 
            key={msg.id}
            content={msg.content}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
      </div>
    </div>
  );
} 
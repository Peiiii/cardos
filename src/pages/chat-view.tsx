import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Message } from '@/components/chat/message';
import { useResponsive } from '@/hooks/use-responsive';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';

type ContextType = { 
  messages: Array<{ id: string; content: string; isUser: boolean; timestamp: string }>;
  handleSendMessage: (content: string) => void;
};

export default function ChatView() {
  const { messages, handleSendMessage } = useOutletContext<ContextType>();
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className="flex flex-col h-full w-full bg-white">
        {/* 消息列表 - 填充剩余空间 */}
        <div className="flex-1 overflow-hidden">
          <MessageList className="h-full">
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
        <div className="flex-shrink-0">
          <MessageInput 
            onSend={handleSendMessage} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {messages.map(msg => (
        <Message 
          key={msg.id}
          content={msg.content}
          isUser={msg.isUser}
          timestamp={msg.timestamp}
        />
      ))}
    </div>
  );
} 
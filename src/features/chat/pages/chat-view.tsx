import { Message } from '@/features/chat/components/message';
import { MessageInput } from '@/features/chat/components/message-input';
import { MessageList } from '@/features/chat/components/message-list';
import { CardPreview } from '@/features/chat/components/card-preview';
import { useResponsive } from '@/shared/hooks/use-responsive';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMessages } from '../hooks/use-messages';
import { useConversations } from '../hooks/use-conversations';
import { chatStore } from '@/features/chat/stores/chat-store';
import { getChatService } from '../services';

export default function ChatView() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { data: messages, update: updateMessage } = useMessages();
  const { createConversation } = useConversations();
  const { isMobile } = useResponsive();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // 同步当前会话ID到store
  useEffect(() => {
    chatStore.getState().setCurrentConversationId(conversationId || null);
  }, [conversationId]);

  // 处理发送消息
  const handleMessageSend = async (content: string) => {
    if (isSendingMessage) return;
    
    try {
      setIsSendingMessage(true);
      
      if (!conversationId) {
        setIsCreatingConversation(true);
        // 1. 创建新对话
        const newConversation = await createConversation({
          title: content.slice(0, 30) + '...', // 使用第一条消息作为标题
          timestamp: Date.now()
        });
        
        // 2. 更新URL
        navigate(`/chat/${newConversation.id}`);
        
        // 3. 发送消息
        await getChatService().sendMessage(
          content,
          newConversation.id,
          (updatedMessage) => {
            updateMessage(updatedMessage.id, updatedMessage);
          }
        );
      } else {
        // 直接发送消息
        await getChatService().sendMessage(
          content,
          conversationId,
          (updatedMessage) => {
            updateMessage(updatedMessage.id, updatedMessage);
          }
        );
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // TODO: 显示错误提示
    } finally {
      setIsSendingMessage(false);
      setIsCreatingConversation(false);
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full bg-background">
        {/* 消息列表 - 填充剩余空间 */}
        <div className="flex-1 overflow-hidden relative">
          <MessageList className="absolute inset-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-background">
            {(messages || []).map(msg => (
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
            isDisabled={isCreatingConversation || isSendingMessage}
            isLoading={isCreatingConversation || isSendingMessage}
            onSend={handleMessageSend}
          />
        </div>

        {/* 卡片预览 */}
        <CardPreview />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-background">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {(messages || []).map(msg => (
            <Message 
              key={msg.id}
              content={msg.content}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}
        </div>
      </div>
      
      {/* 桌面版输入区域 */}
      <div className="flex-shrink-0 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto px-4">
          <MessageInput 
            isDisabled={isCreatingConversation || isSendingMessage}
            isLoading={isCreatingConversation || isSendingMessage}
            onSend={handleMessageSend}
          />
        </div>
      </div>

      {/* 卡片预览 */}
      <CardPreview />
    </div>
  );
} 
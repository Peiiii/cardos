import { Message as MessageComponent } from '@/features/chat/components/message';
import { Message as MessageType } from '../types/message';
import { MessageInput } from './message-input';
import { MessageList } from './message-list';

interface ChatContentProps {
  messages: MessageType[];
  onSendMessage: (content: string) => void;
}

export function ChatContent({ messages, onSendMessage }: ChatContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto">
        <MessageList>
          {messages.map(msg => (
            <MessageComponent
              key={msg.id}
              content={msg.content}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}
        </MessageList>
      </div>

      {/* 输入框 */}
      <div className="border-t border-border p-4">
        <MessageInput onSend={onSendMessage} />
      </div>
    </div>
  );
} 
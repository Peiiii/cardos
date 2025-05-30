import { ReactNode } from 'react';
import { cn } from '@/shared/utils/utils';
import { MessageList } from '@/features/chat/components/message-list';
import { MessageInput } from '@/features/chat/components/message-input';

interface ChatAreaProps {
  className?: string;
  children?: ReactNode;
  onSendMessage?: (message: string) => void;
}

export function ChatArea({ className, children, onSendMessage }: ChatAreaProps) {
  return (
    <div className={cn(
      "flex flex-col h-full w-full bg-white",
      className
    )}>
      {/* 消息列表 - 填充剩余空间 */}
      <div className="flex-1 overflow-hidden">
        <MessageList className="h-full">
          {children}
        </MessageList>
      </div>

      {/* 输入区域 - 固定在底部 */}
      <div className="flex-shrink-0">
        <MessageInput 
          onSend={(message) => onSendMessage?.(message)} 
        />
      </div>
    </div>
  );
} 
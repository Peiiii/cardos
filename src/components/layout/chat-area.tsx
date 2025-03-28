import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { useResponsive } from '@/hooks/use-responsive';

interface ChatAreaProps {
  className?: string;
  children?: ReactNode;
  onSendMessage?: (message: string) => void;
}

export function ChatArea({ className, children, onSendMessage }: ChatAreaProps) {
  const { isMobile } = useResponsive();
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-white",
      isMobile ? "w-full" : "w-[400px] border-r border-r-gray-100",
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
import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  className?: string;
  children: ReactNode;
}

export function MessageList({ className, children }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 当新消息到达时自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [children]);

  return (
    <ScrollArea className={cn("h-full", className)} ref={scrollAreaRef}>
      <div className="p-4 pb-10">
        {children}
      </div>
    </ScrollArea>
  );
} 
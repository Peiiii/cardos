import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationListProps {
  className?: string;
  children: ReactNode;
}

export function ConversationList({ className, children }: ConversationListProps) {
  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="p-4">
        {children}
      </div>
    </ScrollArea>
  );
} 
import { ReactNode } from 'react';
import { cn } from '@/shared/utils/utils';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

interface CardPreviewProps {
  className?: string;
  children?: ReactNode;
}

export function CardPreview({ className, children }: CardPreviewProps) {
  return (
    <div className={cn(
      "flex flex-col h-full flex-1 bg-background pt-8 px-8 pb-6 border-l border-border",
      "transition-all duration-300 ease-in-out",
      className
    )}>
      <h2 className="text-sm font-medium text-muted-foreground mb-4 pl-1">卡片预览</h2>
      <ScrollArea className="flex-1 pr-2">
        <div className="flex items-start justify-center">
          <div className="w-full max-w-2xl mx-auto transform transition-all duration-300">
            {children}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardPreviewProps {
  className?: string;
  children?: ReactNode;
}

export function CardPreview({ className, children }: CardPreviewProps) {
  return (
    <div className={cn(
      "flex flex-col h-full flex-1 min-w-[600px] bg-gradient-to-br from-blue-50/20 via-white to-blue-50/10 p-8",
      className
    )}>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-3xl transform transition-all duration-500 hover:scale-[1.01]">
          {children}
        </div>
      </div>
    </div>
  );
} 
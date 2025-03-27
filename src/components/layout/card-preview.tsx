import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardPreviewProps {
  className?: string;
  children?: ReactNode;
}

export function CardPreview({ className, children }: CardPreviewProps) {
  return (
    <div className={cn(
      "flex flex-col h-full flex-1 min-w-[600px] bg-[#F8F9FC] p-6 pl-8 border-l border-l-gray-100",
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
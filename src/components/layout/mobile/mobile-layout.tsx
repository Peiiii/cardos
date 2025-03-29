import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileLayout({ children, className }: MobileLayoutProps) {
  return (
    <div className={cn(
      "flex flex-col h-screen w-full overflow-hidden",
      className
    )}>
      {children}
    </div>
  );
} 
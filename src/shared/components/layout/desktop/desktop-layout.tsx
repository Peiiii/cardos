import { ReactNode } from 'react';
import { cn } from '@/shared/utils/utils';

interface DesktopLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DesktopLayout({ children, className }: DesktopLayoutProps) {
  return (
    <div className={cn(
      "flex flex-row h-screen w-full overflow-hidden",
      className
    )}>
      {children}
    </div>
  );
} 
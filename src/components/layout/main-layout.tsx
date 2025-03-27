import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={cn(
      "flex h-screen w-full overflow-hidden",
      className
    )}>
      {children}
    </div>
  );
}
 
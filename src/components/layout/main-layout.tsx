import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/use-responsive';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const { isMobile } = useResponsive();
  
  return (
    <div className={cn(
      "flex h-screen w-full overflow-hidden",
      isMobile ? "flex-col" : "flex-row",
      className
    )}>
      {children}
    </div>
  );
}
 
import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/shared/utils/utils';
import { MobileHeader } from './mobile-header';
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';
import { useLocation } from 'react-router-dom';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  title?: string;
  drawer?: ReactNode;
}

export function MobileLayout({ 
  children, 
  className,
  title,
  drawer
}: MobileLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  // 当路由变化时关闭抽屉
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location]);

  return (
    <div className={cn(
      "flex flex-col min-h-screen w-full bg-background",
      className
    )}>
      {/* 顶部导航栏 */}
      <MobileHeader
        title={title || "CardOS"}
        onMenuClick={() => setIsDrawerOpen(true)}
      />
      
      {/* 主要内容区域 */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* 抽屉菜单 */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0">
          {drawer}
        </SheetContent>
      </Sheet>
    </div>
  );
} 
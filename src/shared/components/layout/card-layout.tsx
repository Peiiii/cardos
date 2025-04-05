import { Button } from '@/shared/components/ui/button';
import { useResponsive } from '@/shared/hooks/use-responsive';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

// 桌面端组件
import { DesktopLayout } from './desktop/desktop-layout';
import { Sidebar as DesktopSidebar } from './desktop/sidebar';

// 移动端组件
import { Drawer as MobileDrawer } from './mobile/drawer';
import { MobileLayout } from './mobile/mobile-layout';

interface CardLayoutProps {
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  onBack?: () => void;
}

export function CardLayout({ 
  sidebarContent,
  onBack 
}: CardLayoutProps) {
  const { isMobile } = useResponsive();
  
  // 移动端抽屉状态
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 移动端布局
  if (isMobile) {
    return (
      <MobileLayout>
        <MobileDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        >
          {sidebarContent}
        </MobileDrawer>
        
        {/* 返回按钮 */}
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="bg-white/80 backdrop-blur-sm shadow-sm"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* 渲染子路由内容 - 卡片详情 */}
        <div className="p-0 pt-14 h-full w-full">
          <Outlet />
        </div>
      </MobileLayout>
    );
  }

  // 桌面端布局 - 不包含右侧卡片预览区域
  return (
    <DesktopLayout>
      <DesktopSidebar>
        {sidebarContent}
      </DesktopSidebar>
      
      {/* 卡片详情占据剩余全部空间 */}
      <div className="flex-1 h-full overflow-auto">
        <Outlet />
      </div>
    </DesktopLayout>
  );
} 
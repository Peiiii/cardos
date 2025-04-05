import { useResponsive } from '@/shared/hooks/use-responsive';
import { Outlet } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/utils';

// 桌面端组件
import { DesktopLayout } from './desktop/desktop-layout';
import { Sidebar as DesktopSidebar } from './desktop/sidebar';

// 移动端组件
import { MobileLayout } from './mobile/mobile-layout';

interface MainLayoutProps {
  title?: string;
  navigationItems?: {
    id: string;
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    className?: string;
  }[];
  sidebarContent?: React.ReactNode;
}

export function MainLayout({ 
  title = "CardOS",
  navigationItems = [],
  sidebarContent
}: MainLayoutProps) {
  const { isMobile } = useResponsive();

  // 移动端布局
  if (isMobile) {
    return (
      <MobileLayout
        title={title}
        drawer={
          <div className="flex flex-col h-full">
            {/* Logo 和品牌 */}
            <div className="flex items-center justify-center py-4 border-b border-border">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {title}
              </h1>
            </div>
            
            {/* 导航菜单 */}
            <div className="flex flex-col gap-2 p-4">
              {navigationItems.map(item => (
                <Button 
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "justify-start",
                    item.className
                  )}
                  onClick={item.onClick}
                >
                  {item.icon}
                  {item.title}
                </Button>
              ))}
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-border" />

            {/* 侧边栏内容 */}
            <div className="flex-1 overflow-auto">
              {sidebarContent}
            </div>
          </div>
        }
      >
        <Outlet />
      </MobileLayout>
    );
  }

  // 桌面端布局
  return (
    <DesktopLayout>
      <DesktopSidebar>
        {sidebarContent}
      </DesktopSidebar>
      
      {/* 主内容区域 */}
      <div className="flex-1 h-full overflow-auto">
        <Outlet />
      </div>
    </DesktopLayout>
  );
}
 
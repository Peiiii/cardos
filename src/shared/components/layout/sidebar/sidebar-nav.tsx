import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { sidebarStore } from '@/store/sidebar-store';
import { useLocation } from 'react-router-dom';

interface SidebarNavProps {
  className?: string;
  isCollapsed?: boolean;
}

export function SidebarNav({ 
  className, 
  isCollapsed = false
}: SidebarNavProps) {
  const location = useLocation();
  const { topItems, bottomItems } = sidebarStore();

  // 判断当前路由是否激活
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={cn(
      "flex flex-col h-full",
      isCollapsed && "items-center",
      className
    )}>
      {/* 顶部导航项 */}
      <div className="flex flex-col gap-2 p-4">
        {topItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button 
              key={item.id}
              variant="ghost" 
              size={isCollapsed ? "icon" : "default"}
              className={cn(
                isCollapsed 
                  ? "w-10 h-10 rounded-full hover:bg-accent hover:text-accent-foreground" 
                  : "justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                item.id === 'new-chat' && !isCollapsed && "font-medium",
                isActive(item.path) && "bg-accent text-accent-foreground"
              )}
              onClick={item.onClick}
              title={item.title}
            >
              <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && item.title}
              {isCollapsed && (
                <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
                  {item.title}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* 底部导航项 */}
      <div className="mt-auto p-4">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button 
              key={item.id}
              variant="ghost" 
              size={isCollapsed ? "icon" : "default"}
              className={cn(
                isCollapsed 
                  ? "w-10 h-10 rounded-full hover:bg-accent hover:text-accent-foreground" 
                  : "justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isActive(item.path) && "bg-accent text-accent-foreground"
              )}
              onClick={item.onClick}
              title={item.title}
            >
              <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && item.title}
              {isCollapsed && (
                <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
                  {item.title}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
} 
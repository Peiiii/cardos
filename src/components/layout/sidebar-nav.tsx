import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Settings } from 'lucide-react';

interface SidebarNavProps {
  className?: string;
  isCollapsed?: boolean;
  onHistoryClick?: () => void;
  onNewChatClick?: () => void;
  onSettingsClick?: () => void;
  isActive?: (path: string) => boolean;
}

export function SidebarNav({ 
  className, 
  isCollapsed = false,
  onHistoryClick,
  onNewChatClick,
  onSettingsClick,
  isActive
}: SidebarNavProps) {
  return (
    <div className={cn(
      "flex flex-col gap-2 p-4",
      isCollapsed && "items-center p-2",
      className
    )}>
      <Button 
        variant="ghost" 
        size={isCollapsed ? "icon" : "default"}
        className={cn(
          isCollapsed 
            ? "w-10 h-10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200 relative group" 
            : "justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
          isActive?.('/home') && "bg-accent text-accent-foreground"
        )}
        onClick={onHistoryClick}
        title="历史对话"
      >
        <MessageSquare className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
        {!isCollapsed && "历史对话"}
        {isCollapsed && (
          <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            历史对话
          </span>
        )}
      </Button>
      <Button 
        variant="ghost" 
        size={isCollapsed ? "icon" : "default"}
        className={cn(
          isCollapsed 
            ? "w-10 h-10 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200 relative group" 
            : "justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium",
          isActive?.('/chat') && "bg-accent text-accent-foreground"
        )}
        onClick={onNewChatClick}
        title="新建对话"
      >
        <Plus className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
        {!isCollapsed && "新建对话"}
        {isCollapsed && (
          <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            新建对话
          </span>
        )}
      </Button>
      <Button 
        variant="ghost" 
        size={isCollapsed ? "icon" : "default"}
        className={cn(
          isCollapsed 
            ? "w-10 h-10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200 relative group" 
            : "justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isActive?.('/settings') && "bg-accent text-accent-foreground"
        )}
        onClick={onSettingsClick}
        title="设置"
      >
        <Settings className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
        {!isCollapsed && "设置"}
        {isCollapsed && (
          <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            设置
          </span>
        )}
      </Button>
    </div>
  );
} 
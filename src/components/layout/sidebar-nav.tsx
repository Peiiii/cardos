import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Settings } from 'lucide-react';

interface SidebarNavProps {
  className?: string;
  isCollapsed?: boolean;
  onHistoryClick?: () => void;
  onNewChatClick?: () => void;
  onSettingsClick?: () => void;
}

export function SidebarNav({ 
  className, 
  isCollapsed = false,
  onHistoryClick,
  onNewChatClick,
  onSettingsClick
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
            ? "w-10 h-10 rounded-full" 
            : "justify-start text-blue-600 hover:bg-blue-100 hover:text-blue-700 active:bg-blue-200" 
        )}
        onClick={onHistoryClick}
        title="历史对话"
      >
        <MessageSquare className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
        {!isCollapsed && "历史对话"}
      </Button>
      <Button 
        variant="default" 
        size={isCollapsed ? "icon" : "default"}
        className={cn(
          isCollapsed 
            ? "w-10 h-10 rounded-full" 
            : "justify-start bg-blue-500 hover:bg-blue-600 text-white shadow-sm" 
        )}
        onClick={onNewChatClick}
        title="新建对话"
      >
        <Plus className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
        {!isCollapsed && "新建对话"}
      </Button>
      <Button 
        variant="ghost" 
        size={isCollapsed ? "icon" : "default"}
        className={cn(
          isCollapsed 
            ? "w-10 h-10 rounded-full" 
            : "justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-700" 
        )}
        onClick={onSettingsClick}
        title="设置"
      >
        <Settings className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
        {!isCollapsed && "设置"}
      </Button>
    </div>
  );
} 
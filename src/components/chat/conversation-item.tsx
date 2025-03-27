import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, MoreVertical } from 'lucide-react';

export interface ConversationItemProps {
  title: string;
  isActive?: boolean;
  timestamp?: string;
  onClick?: () => void;
  onMenuClick?: () => void;
}

export function ConversationItem({ 
  title, 
  isActive = false, 
  timestamp, 
  onClick,
  onMenuClick
}: ConversationItemProps) {
  return (
    <div className="group relative">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start mb-1 p-2 transition-all duration-200 rounded-lg overflow-hidden",
          isActive 
            ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
            : "hover:bg-gray-100 hover:translate-x-1"
        )}
        onClick={onClick}
      >
        <MessageSquare className={cn(
          "mr-2 h-4 w-4 transition-colors duration-200 flex-shrink-0",
          isActive ? "text-blue-500" : "text-gray-500"
        )} />
        <div className="flex flex-col items-start text-left overflow-hidden">
          <span className={cn(
            "text-sm font-medium truncate w-full transition-colors duration-200",
            isActive ? "text-blue-700" : "text-foreground"
          )}>
            {title}
          </span>
          {timestamp && (
            <span className={cn(
              "text-xs truncate w-full",
              isActive ? "text-blue-400" : "text-muted-foreground"
            )}>
              {timestamp}
            </span>
          )}
        </div>
      </Button>
      
      {/* 更多菜单按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 hover:bg-blue-100 text-gray-500 hover:text-blue-600"
        onClick={(e) => {
          e.stopPropagation();
          onMenuClick?.();
        }}
      >
        <MoreVertical className="h-3 w-3" />
      </Button>
    </div>
  );
} 
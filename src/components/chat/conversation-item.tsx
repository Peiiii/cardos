import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export interface ConversationItemProps {
  title: string;
  isActive?: boolean;
  timestamp?: number | string;
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
  // 格式化时间
  console.log('timestamp', timestamp);
  const formattedTime = timestamp ? formatDistanceToNow(new Date(timestamp), { 
    addSuffix: true,
    locale: zhCN 
  }) : undefined;

  return (
    <div className="group relative">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start mb-1 p-2 transition-all duration-200 rounded-lg overflow-hidden",
          isActive 
            ? "bg-accent text-accent-foreground hover:bg-accent/80" 
            : "hover:bg-muted hover:translate-x-1"
        )}
        onClick={onClick}
      >
        <MessageSquare className={cn(
          "mr-2 h-4 w-4 transition-colors duration-200 flex-shrink-0",
          isActive ? "text-accent-foreground" : "text-muted-foreground"
        )} />
        <div className="flex flex-col items-start text-left overflow-hidden">
          <span className={cn(
            "text-sm font-medium truncate w-full transition-colors duration-200",
            isActive ? "text-accent-foreground" : "text-foreground"
          )}>
            {title}
          </span>
          {formattedTime && (
            <span className={cn(
              "text-xs truncate w-full",
              isActive ? "text-accent-foreground/70" : "text-muted-foreground"
            )}>
              {formattedTime}
            </span>
          )}
        </div>
      </Button>
      
      {/* 更多菜单按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 hover:bg-accent text-muted-foreground hover:text-accent-foreground"
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
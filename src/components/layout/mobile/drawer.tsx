import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SidebarNav } from '../sidebar-nav';
import { ConversationList } from '@/components/chat/conversation-list';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface DrawerProps {
  className?: string;
  children?: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onHistoryClick?: () => void;
  onNewChatClick?: () => void;
  onSettingsClick?: () => void;
}

export function Drawer({
  className,
  children,
  isOpen,
  onOpenChange,
  onHistoryClick,
  onNewChatClick,
  onSettingsClick
}: DrawerProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50"
        onClick={() => onOpenChange(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0">
          <div className={cn(
            "flex flex-col h-full border-r border-r-gray-100 bg-gradient-to-b from-gray-50/80 to-gray-50/40",
            className
          )}>
            {/* Logo 和品牌 */}
            <div className="flex items-center justify-center py-4 border-b border-b-blue-100">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                CardOS
              </h1>
            </div>
            
            {/* 导航菜单 */}
            <SidebarNav 
              isCollapsed={false}
              onHistoryClick={onHistoryClick}
              onNewChatClick={onNewChatClick}
              onSettingsClick={onSettingsClick}
            />

            {/* 分隔线 */}
            <div className="h-px bg-blue-100" />

            {/* 对话列表 */}
            <ConversationList>
              {children}
            </ConversationList>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 
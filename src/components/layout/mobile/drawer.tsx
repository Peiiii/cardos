import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SidebarNav } from '../sidebar-nav';
import { ConversationList } from '@/components/chat/conversation-list';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

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
        <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0 border-0" hideCloseButton>
          <div className={cn(
            "flex flex-col h-full bg-white",
            className
          )}>
            {/* Logo 和品牌 */}
            <div className="flex items-center justify-between py-4 px-4 border-b border-b-gray-100">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                CardOS
              </h1>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* 导航菜单 */}
            <SidebarNav 
              isCollapsed={false}
              onHistoryClick={onHistoryClick}
              onNewChatClick={onNewChatClick}
              onSettingsClick={onSettingsClick}
            />

            {/* 分隔线 */}
            <div className="h-px bg-gray-100" />

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
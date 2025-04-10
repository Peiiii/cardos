import { ConversationList } from '@/features/chat/components/conversation-list';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';
import { cn } from '@/shared/utils/utils';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface DrawerProps {
  className?: string;
  children?: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Drawer({
  className,
  children,
  isOpen,
  onOpenChange,
}: DrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0 border-0" hideCloseButton>
        <div className={cn(
          "flex flex-col h-full bg-background",
          className
        )}>
          {/* Logo 和品牌 */}
          <div className="flex items-center justify-between py-4 px-4 border-b border-border">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
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
          {/* <SidebarNav 
            isCollapsed={false}
          /> */}

          {/* 分隔线 */}
          <div className="h-px bg-border" />

          {/* 对话列表 */}
          <ConversationList>
            {children}
          </ConversationList>
        </div>
      </SheetContent>
    </Sheet>
  );
} 
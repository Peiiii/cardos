import { ReactNode } from 'react';
import { cn } from '@/shared/utils/utils';
import { SidebarNav } from '../sidebar/sidebar-nav';
import { ConversationList } from '@/features/chat/components/conversation-list';
import { useSidebar } from '@/shared/hooks/use-sidebar';
import { SidebarHeader } from '../sidebar/sidebar-header';

interface SidebarProps {
  className?: string;
  children?: ReactNode;
}

export function Sidebar({ 
  className, 
  children,
}: SidebarProps) {
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <div className={cn(
      "flex flex-col h-full relative border-r border-[--color-sidebar-border] bg-gradient-to-b from-[--color-sidebar-from] to-[--color-sidebar-to]",
      isCollapsed ? "w-[60px]" : "w-[200px]",
      className
    )}>
      <SidebarHeader isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
      
      <div className="flex flex-col flex-1">
        <SidebarNav 
          isCollapsed={isCollapsed}
        />

        <div className="h-px bg-[--color-sidebar-border]" />

        {!isCollapsed && (
          <ConversationList>
            {children}
          </ConversationList>
        )}
      </div>
    </div>
  );
} 
import { ConversationList } from "@/features/chat/components/conversation-list";
import { useSidebar } from "@/shared/hooks/use-sidebar";
import { cn } from "@/shared/utils/utils";
import { ReactNode } from "react";
import { SidebarHeader } from "../sidebar/sidebar-header";
import { SidebarNav } from "../sidebar/sidebar-nav";

interface SidebarProps {
  className?: string;
  children?: ReactNode;
}

export function Sidebar({ className, children }: SidebarProps) {
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex flex-col h-full relative border-r border-[--color-sidebar-border] bg-gradient-to-b from-[--color-sidebar-from] to-[--color-sidebar-to]",
        isCollapsed ? "w-[60px]" : "w-[200px]",
        className
      )}
    >
      <SidebarHeader isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
      <div className="flex flex-col flex-1">
        <SidebarNav.Root isCollapsed={isCollapsed}>
          <SidebarNav.Top />
          <SidebarNav.Middle>
            {!isCollapsed && <ConversationList>{children}</ConversationList>}
          </SidebarNav.Middle>
          <SidebarNav.Bottom />
        </SidebarNav.Root>
      </div>
    </div>
  );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarHeader({ isCollapsed, onToggle }: SidebarHeaderProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-[50%] transform -translate-y-1/2 h-6 w-6 rounded-full border border-[--color-sidebar-button-border] bg-[--color-sidebar-button-bg] shadow-sm text-[--color-sidebar-button-text] hover:text-[--color-sidebar-button-hover-text] hover:bg-[--color-sidebar-button-hover] z-20"
        onClick={onToggle}
        title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="flex items-center justify-center py-4 border-b border-[--color-sidebar-border] overflow-hidden">
        {isCollapsed ? (
          <span className="text-xl font-bold text-[--color-sidebar-button-text]">C</span>
        ) : (
          <h1 className="text-xl font-bold bg-gradient-to-r from-[--color-sidebar-button-text] to-[--color-sidebar-button-hover-text] bg-clip-text text-transparent">
            CardOS
          </h1>
        )}
      </div>
    </>
  );
} 
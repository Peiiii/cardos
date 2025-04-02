import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SidebarNav } from '../sidebar-nav';
import { ConversationList } from '@/components/chat/conversation-list';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

interface SidebarProps {
  className?: string;
  children?: ReactNode;
  onHistoryClick?: () => void;
  onNewChatClick?: () => void;
  onSettingsClick?: () => void;
}

export function Sidebar({ 
  className, 
  children,
  onHistoryClick,
  onNewChatClick,
  onSettingsClick
}: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev: boolean) => !prev);
  };

  // 判断当前路由是否激活
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={cn(
      "flex flex-col h-full relative border-r border-[--color-sidebar-border] bg-gradient-to-b from-[--color-sidebar-from] to-[--color-sidebar-to] transition-all duration-300",
      isCollapsed ? "w-[60px]" : "w-[200px]",
      className
    )}>
      {/* 收起/展开按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-[50%] transform -translate-y-1/2 h-6 w-6 rounded-full border border-[--color-sidebar-button-border] bg-[--color-sidebar-button-bg] shadow-sm text-[--color-sidebar-button-text] hover:text-[--color-sidebar-button-hover-text] hover:bg-[--color-sidebar-button-hover] z-20 transition-colors duration-200"
        onClick={toggleCollapsed}
        title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Logo 和品牌 */}
      <div className="flex items-center justify-center py-4 border-b border-[--color-sidebar-border] overflow-hidden">
        {isCollapsed ? (
          <span className="text-xl font-bold text-[--color-sidebar-button-text]">C</span>
        ) : (
          <h1 className="text-xl font-bold bg-gradient-to-r from-[--color-sidebar-button-text] to-[--color-sidebar-button-hover-text] bg-clip-text text-transparent">
            CardOS
          </h1>
        )}
      </div>
      
      {/* 导航菜单 */}
      <SidebarNav 
        isCollapsed={isCollapsed}
        onHistoryClick={onHistoryClick}
        onNewChatClick={onNewChatClick}
        onSettingsClick={onSettingsClick}
        isActive={isActive}
      />

      {/* 分隔线 */}
      <div className="h-px bg-[--color-sidebar-border]" />

      {/* 对话列表 */}
      {!isCollapsed && (
        <ConversationList>
          {children}
        </ConversationList>
      )}
    </div>
  );
} 
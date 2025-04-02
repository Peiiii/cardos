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
      "flex flex-col h-full relative border-r border-r-gray-100 bg-gradient-to-b from-gray-50/80 to-gray-50/40 transition-all duration-300",
      isCollapsed ? "w-[60px]" : "w-[200px]",
      className
    )}>
      {/* 收起/展开按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-[50%] transform -translate-y-1/2 h-6 w-6 rounded-full border border-blue-100 bg-white shadow-sm text-blue-500 hover:text-blue-700 hover:bg-blue-50 z-20 transition-colors duration-200"
        onClick={toggleCollapsed}
        title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Logo 和品牌 */}
      <div className="flex items-center justify-center py-4 border-b border-b-blue-100 overflow-hidden">
        {isCollapsed ? (
          <span className="text-xl font-bold text-blue-600">C</span>
        ) : (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
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
      <div className="h-px bg-blue-100" />

      {/* 对话列表 */}
      {!isCollapsed && (
        <ConversationList>
          {children}
        </ConversationList>
      )}
    </div>
  );
} 
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { sidebarStore } from '@/store/sidebar-store';
import { useLocation } from 'react-router-dom';
import { createContext, useContext } from 'react';
import type { NavItem } from '@/store/sidebar-store';

// Context for sharing isCollapsed state
interface SidebarContext {
  isCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContext | undefined>(undefined);

const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('Sidebar components must be used within SidebarNav.Root');
  }
  return context;
};

// Shared types
interface SidebarNavRootProps {
  className?: string;
  isCollapsed?: boolean;
  children: React.ReactNode;
}

interface SidebarNavSectionProps {
  children?: React.ReactNode;
  className?: string;
}

// Shared NavItem component
const NavItem = ({ item }: { item: NavItem }) => {
  const location = useLocation();
  const { isCollapsed } = useSidebarContext();
  const Icon = item.icon;
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Button 
      key={item.id}
      variant="ghost" 
      size={isCollapsed ? "icon" : "default"}
      className={cn(
        isCollapsed 
          ? "w-10 h-10 rounded-full hover:bg-accent hover:text-accent-foreground" 
          : "justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        item.id === 'new-chat' && !isCollapsed && "font-medium",
        isActive(item.path) && "bg-accent text-accent-foreground"
      )}
      onClick={item.onClick}
      title={item.title}
    >
      <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
      {!isCollapsed && item.title}
      {isCollapsed && (
        <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
          {item.title}
        </span>
      )}
    </Button>
  );
};

// Compound components
const Root = ({ children, className, isCollapsed = false }: SidebarNavRootProps) => {
  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <div className={cn(
        "flex flex-col h-full",
        isCollapsed && "items-center",
        className
      )}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

const Top = ({ className, children }: SidebarNavSectionProps) => {
  const { topItems } = sidebarStore();

  return (
    <div className={cn("flex flex-col gap-2 p-4", className)}>
      {topItems.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
      {children}
    </div>
  );
};

const Middle = ({ className, children }: SidebarNavSectionProps) => {
  return (
    <div className={cn("flex-1 overflow-hidden", className)}>
      {children}
    </div>
  );
};

const Bottom = ({ className, children }: SidebarNavSectionProps) => {
  const { bottomItems } = sidebarStore();

  return (
    <div className={cn("mt-auto p-4", className)}>
      {bottomItems.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
      {children}
    </div>
  );
};

export const SidebarNav = {
  Root,
  Top,
  Middle,
  Bottom,
}; 
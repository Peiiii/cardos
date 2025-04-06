import { SidebarNav } from '../sidebar/sidebar-nav';

interface SidebarContentProps {
  title: string;
  children?: React.ReactNode;
}

export function SidebarContent({ title, children }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo 和品牌 */}
      <div className="flex items-center justify-between py-4 px-4 border-b border-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>

      {/* 导航菜单 */}
      <SidebarNav.Root isCollapsed={false}>
        <SidebarNav.Top />
        <SidebarNav.Middle>
          {children}
        </SidebarNav.Middle>
        <SidebarNav.Bottom />
      </SidebarNav.Root>

      {/* 分隔线 */}
      <div className="h-px bg-border" />
    </div>
  );
} 
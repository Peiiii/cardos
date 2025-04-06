import { useResponsive } from "@/shared/hooks/use-responsive";

// 桌面端组件
import { DesktopLayout } from "./desktop/desktop-layout";
import { Sidebar as DesktopSidebar } from "./desktop/sidebar";

// 移动端组件
import { ConversationList } from "@/shared/components/layout/shared/conversation-list";
import { MobileLayout } from "./mobile/mobile-layout";
import { SidebarContent } from "./shared/sidebar-content";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  sidebarContent?: React.ReactNode;
}

export function MainLayout({
  children,
  title = "CardOS",
  sidebarContent,
}: MainLayoutProps) {
  const { isMobile } = useResponsive();

  // 移动端布局
  if (isMobile) {
    return (
      <MobileLayout
        title={title}
        drawer={<SidebarContent title={title}>{sidebarContent}</SidebarContent>}
      >
        {children}
      </MobileLayout>
    );
  }

  // 桌面端布局
  return (
    <DesktopLayout>
      <DesktopSidebar>
        <ConversationList />
      </DesktopSidebar>

      {/* 主内容区域 */}
      <div className="flex-1 h-full overflow-auto">{children}</div>
    </DesktopLayout>
  );
}

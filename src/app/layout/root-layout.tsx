import { DesktopLayout } from "@/shared/components/layout/desktop/desktop-layout";
import { useResponsive } from "@/shared/hooks/use-responsive";

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * 应用程序的根布局组件
 * 负责应用全局主题和样式，不包含特定的页面布局
 */
export function RootLayout({ children }: RootLayoutProps) {
  const { isMobile } = useResponsive();
  const renderContent = () => {
    if (isMobile) return children;
    return <DesktopLayout>{children}</DesktopLayout>;
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {renderContent()}
    </div>
  );
}

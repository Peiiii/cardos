import { Outlet } from 'react-router-dom';

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * 应用程序的根布局组件
 * 负责应用全局主题和样式，不包含特定的页面布局
 */
export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {children}
    </div>
  );
} 
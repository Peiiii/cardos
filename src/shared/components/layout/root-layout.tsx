import { Outlet } from 'react-router-dom';

/**
 * 应用程序的根布局组件
 * 负责应用全局主题和样式，不包含特定的页面布局
 */
export function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
    </div>
  );
} 
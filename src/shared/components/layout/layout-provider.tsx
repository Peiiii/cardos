import { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { RootLayout } from './root-layout';
import { MainLayout } from './main-layout';
import { ChatLayout } from './chat-layout';
import { CardLayout } from './card-layout';

type LayoutType = 'main' | 'chat' | 'card';

export function LayoutProvider() {
  const location = useLocation();
  const [layoutType, setLayoutType] = useState<LayoutType>(() => {
    if (location.pathname.startsWith('/chat')) {
      return 'chat';
    }
    if (location.pathname.startsWith('/card')) {
      return 'card';
    }
    return 'main';
  });

  // 监听路由变化
  useEffect(() => {
    if (location.pathname.startsWith('/chat')) {
      setLayoutType('chat');
    } else if (location.pathname.startsWith('/card')) {
      setLayoutType('card');
    } else {
      setLayoutType('main');
    }
  }, [location.pathname]);

  const renderLayout = () => {
    const children = <Outlet />;

    switch (layoutType) {
      case 'chat':
        return <ChatLayout>{children}</ChatLayout>;
      case 'card':
        return <CardLayout>{children}</CardLayout>;
      case 'main':
      default:
        return <MainLayout>{children}</MainLayout>;
    }
  };

  return (
    <RootLayout>
      {renderLayout()}
    </RootLayout>
  );
} 
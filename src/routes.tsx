import { RouteObject, Navigate } from 'react-router-dom';

// 页面组件
import HomePage from '@/pages/home';
import CreateCardPage from '@/pages/create-card';
import SettingsPage from '@/pages/settings';
import NotFoundPage from '@/pages/not-found';
import ChatView from '@/pages/chat-view';
import CardView from '@/pages/card-view';

// 布局组件
import { RootLayout } from '@/shared/components/layout/root-layout';
import { MainLayout } from '@/shared/components/layout/main-layout';
import { ChatLayout } from '@/shared/components/layout/chat-layout';
import { CardLayout } from '@/shared/components/layout/card-layout';

// 路由配置
const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/chat" replace />
      },
      // 聊天相关路由 - 使用聊天布局（带卡片预览）
      {
        path: 'chat',
        element: <ChatLayout />,
        children: [
          {
            index: true,
            element: <ChatView />
          },
          {
            path: ':conversationId',
            element: <ChatView />
          }
        ]
      },
      // 卡片详情路由 - 使用卡片布局（无卡片预览）
      {
        path: 'card/:cardId',
        element: <CardLayout />,
        children: [
          {
            index: true,
            element: <CardView />
          }
        ]
      },
      // 其他页面路由 - 使用主布局
      {
        element: <MainLayout />,
        children: [
          {
            path: 'home',
            element: <HomePage />
          },
          {
            path: 'create',
            element: <CreateCardPage />
          },
          {
            path: 'settings',
            element: <SettingsPage />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];

export default routes; 
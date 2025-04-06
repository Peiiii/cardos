import { RouteObject, Navigate } from 'react-router-dom';

// 页面组件
import HomePage from '@/pages/home';
import CreateCardPage from '@/features/chat/pages/create-card';
import SettingsPage from '@/features/settings/pages/settings';
import NotFoundPage from '@/pages/not-found';
import ChatView from '@/features/chat/pages/chat-view';
import CardView from '@/features/card/pages/card-view';

// 布局提供者
import { LayoutProvider } from '@/shared/components/layout/layout-provider';

// 路由配置
const routes: RouteObject[] = [
  {
    path: '/',
    element: <LayoutProvider />,
    children: [
      {
        index: true,
        element: <Navigate to="/chat" replace />
      },
      // 聊天相关路由
      {
        path: 'chat',
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
      // 卡片详情路由
      {
        path: 'card/:cardId',
        children: [
          {
            index: true,
            element: <CardView />
          }
        ]
      },
      // 其他页面路由
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
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];

export default routes; 
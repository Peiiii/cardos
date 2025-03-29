import { RouteObject, Navigate } from 'react-router-dom';

// 页面组件
import HomePage from '@/pages/home';
import CreateCardPage from '@/pages/create-card';
import SettingsPage from '@/pages/settings';
import NotFoundPage from '@/pages/not-found';
import ChatView from '@/pages/chat-view';
import CardView from '@/pages/card-view';

// 布局组件
import { Layout } from '@/components/layout/layout';

// 路由配置
const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/chat" replace />
      },
      {
        path: 'chat',
        element: <ChatView />
      },
      {
        path: 'chat/:conversationId',
        element: <ChatView />
      },
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
      },
      {
        path: 'card/:cardId',
        element: <CardView />
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];

export default routes; 
import { useRoutes } from 'react-router-dom';
import routes from './routes';

// 应用主组件
export default function App() {
  // 使用useRoutes渲染路由配置
  const element = useRoutes(routes);
  
  return element;
}

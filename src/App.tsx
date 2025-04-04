import { chatPlugin } from '@/features/chat/plugin';
import { settingsPlugin } from '@/features/settings/plugin';
import { PluginManager } from '@/shared/plugins/core/plugin';
import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes';

// 插件列表
const PLUGINS = [
  settingsPlugin,
  chatPlugin,
  // ... 其他插件
];

// 应用主组件
export default function App() {
  // 注册所有插件
  useEffect(() => {
    const pluginManager = PluginManager.getInstance();
    
    // 注册插件
    PLUGINS.forEach(plugin => {
      pluginManager.register(plugin);
    });
    
    return () => {
      // 注销插件
      PLUGINS.forEach(plugin => {
        pluginManager.unregister(plugin.id);
      });
    };
  }, []);

  // 使用useRoutes渲染路由配置
  const element = useRoutes(routes);
  
  return element;
}

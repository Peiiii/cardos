import { cardExtension } from "@/features/card/extensions";
import { chatExtension } from "@/features/chat/extensions";
import { getSettingsExtensions } from "@/features/settings/extensions";
import { kernel } from '../core/kernel';
import { navigationStore } from "@/core/stores/navigation-store";
import { Suspense, useEffect } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import routes from "./routes";
import { LoadingScreen } from "@/components/loading-screen";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).kernel = kernel;

// 应用主组件
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const targetPath = navigationStore((state) => state.targetPath);
  const currentPath = navigationStore((state) => state.currentPath);

  // 监听导航状态变化
  useEffect(() => {
    if (targetPath) {
      navigate(targetPath);
      navigationStore.getState().navigate(null);
    }
  }, [targetPath, navigate]);

  // 监听路由路径变化
  useEffect(() => {
    if (location.pathname !== currentPath) {
      navigationStore.getState().setCurrentPath(location.pathname);
    }
  }, [location.pathname, currentPath]);

  // 注册所有插件
  useEffect(() => {
    [cardExtension, chatExtension, ...getSettingsExtensions()].forEach((extension) => {
      kernel.registerExtension(extension);
    });
    kernel.activateAllExtensions();

    return () => {
      kernel.dispose();
    };
  }, []);

  // 使用useRoutes渲染路由配置
  const element = useRoutes(routes);

  return (
    <Suspense fallback={<LoadingScreen />}>
      {element}
    </Suspense>
  );
}

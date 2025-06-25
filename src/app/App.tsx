import { LoadingScreen } from "@/components/loading-screen";
import { useConnectNavigationStore } from "@/core/hooks/use-connect-navigation-store";
import { cardExtension } from "@/features/card/extensions";
import { chatExtension } from "@/features/chat/extensions";
import { getSettingsExtensions } from "@/features/settings/extensions";
import { Suspense, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { kernel } from '../core/kernel';
import routes from "./routes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).kernel = kernel;

// 应用主组件
export default function App() {
  useConnectNavigationStore();

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

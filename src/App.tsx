import { cardExtension } from "@/features/card/extensions";
import { chatExtension } from "@/features/chat/extensions";
import { getSettingsExtensions } from "@/features/settings/extensions";
import { kernel } from "@/shared/core";
import { navigationStore } from "@/store/navigation-store";
import { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import routes from "./pages/routes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).kernel = kernel;

// 应用主组件
export default function App() {
  const navigate = useNavigate();
  const targetPath = navigationStore((state) => state.targetPath);

  // 监听导航状态
  useEffect(() => {
    if (targetPath) {
      navigate(targetPath);
      navigationStore.getState().navigate(null);
    }
  }, [targetPath, navigate]);

  // 注册所有插件
  useEffect(() => {
    console.log("[App] useEffect");

    kernel.registerExtension(cardExtension);
    kernel.registerExtension(chatExtension);
    getSettingsExtensions().forEach((extension) => {
      kernel.registerExtension(extension);
    });
    kernel.activateAllExtensions();

    return () => {
      console.log("[App] useEffect return");
      kernel.dispose();
    };
  }, []);

  // 使用useRoutes渲染路由配置
  const element = useRoutes(routes);

  return element;
}

import { cardExtension } from "@/features/card/extensions";
import { chatExtension } from "@/features/chat/extensions";
import { getSettingsExtensions } from "@/features/settings/extensions";
import { extensionManager } from "@/shared/core";
import { navigationStore } from "@/store/navigation-store";
import { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import routes from "./pages/routes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).extensionManager = extensionManager;

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

    extensionManager.registerExtension(cardExtension);
    extensionManager.registerExtension(chatExtension);
    getSettingsExtensions().forEach((extension) => {
      extensionManager.registerExtension(extension);
    });
    extensionManager.activateAllExtensions();

    return () => {
      console.log("[App] useEffect return");
      extensionManager.dispose();
    };
  }, []);

  // 使用useRoutes渲染路由配置
  const element = useRoutes(routes);

  return element;
}

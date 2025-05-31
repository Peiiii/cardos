import { navigationStore } from "@/core/stores/navigation-store";
import { sidebarStore } from "@/core/stores/sidebar-store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { themeExtension } from "@/features/settings/extensions/theme";
import { Disposable, ExtensionDefinition } from "@cardos/extension";
import { Settings } from "lucide-react";

export const settingsExtension: ExtensionDefinition = {
  manifest: {
    id: "settings",
    name: "Settings Navigation Item",
    description: "Settings Navigation Item",
    version: "1.0.0",
    author: "cardos",
  },
  activate: ({ subscriptions }) => {
    const store = sidebarStore.getState();
    const { navigate } = navigationStore.getState();

    // 设置
    const settingsId = store.registerItem({
      id: "settings",
      title: "设置",
      icon: Settings,
      path: "/settings",
      position: "top",
      order: 3,
      onClick: () => navigate("/settings"),
    });
    const disconnect = connectRouterWithActivityBar([
      {
        activityKey: "settings",
        routerPath: "/settings",
      },
    ]);
    subscriptions.push(
      Disposable.from(() => {
        store.unregisterItem(settingsId);
        disconnect();
      })
    );
  },
};

export const getSettingsExtensions = () => {
  return [settingsExtension, themeExtension];
};

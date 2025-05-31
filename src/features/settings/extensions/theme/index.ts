import { sidebarStore } from "@/core/stores/sidebar-store";
import { useThemeStore } from "@/core/stores/theme-store";
import { Disposable, ExtensionDefinition } from "@cardos/extension";
import { Moon, Sun } from "lucide-react";

export const themeExtension: ExtensionDefinition = {
  manifest: {
    id: "theme",
    name: "Theme Switcher",
    description: "Theme Switcher",
    version: "1.0.0",
    author: "cardos",
  },
  activate: ({ subscriptions }) => {
    const store = sidebarStore.getState();
    const { mode } = useThemeStore.getState();

    // 底部导航项 - 主题切换
    const themeSwitcherId = store.registerItem({
      id: "theme-switcher",
      title: "主题设置",
      icon: mode === "dark" ? Moon : Sun,
      path: "/settings/theme",
      position: "bottom",
      order: 1,
      notSelectable: true,
      onClick: () => {
        const { mode, setMode } = useThemeStore.getState();
        setMode(mode === "dark" ? "light" : "dark");
      },
    });

    subscriptions.push(
      Disposable.from(() => {
        store.unregisterItem(themeSwitcherId);
      })
    );
  },
};

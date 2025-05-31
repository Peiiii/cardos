import { navigationStore } from "@/core/stores/navigation-store";
import { sidebarStore } from "@/core/stores/sidebar-store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { Disposable, ExtensionDefinition } from "@cardos/extension";
import { Plus } from "lucide-react";

export const chatExtension: ExtensionDefinition = {
  manifest: {
    id: "chat",
    name: "Chat Navigation Items",
    description: "Chat Navigation Items",
    version: "1.0.0",
    author: "cardos",
  },
  activate: ({ subscriptions }) => {
    const store = sidebarStore.getState();
    const { navigate } = navigationStore.getState();
    const newChatId = store.registerItem({
      id: "new-chat",
      title: "新建对话",
      icon: Plus,
      path: "/chat",
      position: "top",
      order: 2,
      onClick: () => navigate("/chat"),
    });
    const disconnect = connectRouterWithActivityBar([
      {
        activityKey: "new-chat",
        routerPath: "/chat",
      },
    ]);
    subscriptions.push(
      Disposable.from(() => {
        store.unregisterItem(newChatId);
        disconnect();
      })
    );
  },
};

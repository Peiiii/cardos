import { navigationStore } from "@/store/navigation-store";
import { sidebarStore } from "@/store/sidebar-store";
import { ExtensionDefinition } from "@cardos/extension";
import { Plus } from "lucide-react";

export const chatExtension: ExtensionDefinition = {
  manifest: {
    id: "chat",
    name: "Chat Navigation Items",
    description: "Chat Navigation Items",
    version: "1.0.0",
    author: "cardos",
  },
  activate: () => {
    const store = sidebarStore.getState();
    const { navigate } = navigationStore.getState();
    // 新建对话
    store.registerItem({
      id: "new-chat",
      title: "新建对话",
      icon: Plus,
      path: "/chat",
      position: "top",
      order: 2,
      onClick: () => navigate("/chat"),
    });
  },
  deactivate: () => {
    const store = sidebarStore.getState();
    ["history", "new-chat"].forEach((id) => {
      store.unregisterItem(id);
    });
  },
};

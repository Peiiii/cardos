import { Plugin } from "@/shared/plugins/core/plugin";
import { navigationStore } from "@/store/navigation-store";
import { sidebarStore } from "@/store/sidebar-store";
import { Plus } from "lucide-react";

export const chatPlugin: Plugin = {
  id: "chat",
  name: "Chat Navigation Items",
  register: () => {
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
  unregister: () => {
    const store = sidebarStore.getState();
    ["history", "new-chat"].forEach((id) => {
      store.unregisterItem(id);
    });
  },
};

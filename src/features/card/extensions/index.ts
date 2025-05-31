import { FileText, CreditCard } from "lucide-react";
import { sidebarStore } from "@/core/stores/sidebar-store";
import { navigationStore } from "@/core/stores/navigation-store";
import { ExtensionDefinition, Disposable } from "@cardos/extension";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";

export const cardExtension: ExtensionDefinition = {
  manifest: {
    id: "card",
    name: "Card Navigation Items",
    version: "1.0.0",
    description: "Card Navigation Items",
  },
  activate: (context) => {
    console.log("[cardExtension] activate");
    const { subscriptions } = context;
    const store = sidebarStore.getState();
    const { navigate } = navigationStore.getState();

    // 我的卡片
    const myCardsId = store.registerItem({
      id: "my-cards",
      title: "我的卡片",
      icon: FileText,
      path: "/my-cards",
      position: "top",
      order: 1,
      onClick: () => navigate("/my-cards"),
    });
    console.log("[cardExtension] [registerItem] myCardsId", myCardsId);

    // 创建卡片
    const createCardId = store.registerItem({
      id: "create-card",
      title: "创建卡片",
      icon: CreditCard,
      path: "/create",
      position: "top",
      order: 2,
      onClick: () => navigate("/create"),
    });

    subscriptions.push(
      Disposable.from(() => {
        store.unregisterItem(myCardsId);
        console.log("[cardExtension] [unregisterItem] myCardsId", myCardsId);
        store.unregisterItem(createCardId);
      })
    );
    const disconnect = connectRouterWithActivityBar([
      {
        activityKey: "my-cards",
        routerPath: "/my-cards",
      },
      {
        activityKey: "create-card",
        routerPath: "/create",
      },
    ]);
    subscriptions.push(Disposable.from(() => {
      store.unregisterItem(myCardsId);
      store.unregisterItem(createCardId);
      disconnect();
    }));
  },
};

import { FileText, CreditCard, Gamepad } from "lucide-react";
import { sidebarStore } from "@/core/stores/sidebar-store";
import { navigationStore } from "@/core/stores/navigation-store";
import { ExtensionDefinition, Disposable } from "@cardos/extension";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { linkUtilService } from "@/core/services/link-util.service";

export const cardExtension: ExtensionDefinition = {
  manifest: {
    id: "card",
    name: "Card Navigation Items",
    version: "1.0.0",
    description: "Card Navigation Items",
  },
  activate: (context) => {
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
      onClick: () => navigate(linkUtilService.pathOfMyCards()),
    });

    // 创建卡片
    const createCardId = store.registerItem({
      id: "create-card",
      title: "创建卡片",
      icon: CreditCard,
      path: "/create",
      position: "top",
      order: 2,
      onClick: () => navigate(linkUtilService.pathOfCardCreate()),
    });

    // 卡片游乐场
    const cardPlaygroundId = store.registerItem({
      id: "card-playground",
      title: "卡片游乐场",
      icon: Gamepad,
      path: "/card-playground",
      position: "top",
      order: 3,
      onClick: () => navigate(linkUtilService.pathOfCardPlayground()),
    });

    subscriptions.push(
      Disposable.from(() => {
        store.unregisterItem(myCardsId);
        store.unregisterItem(createCardId);
        store.unregisterItem(cardPlaygroundId);
      })
    );
    const disconnect = connectRouterWithActivityBar([
      {
        activityKey: "my-cards",
        routerPaths: ["/my-cards", "/card/:cardId"],
      },
      {
        activityKey: "create-card",
        routerPath: "/create",
      },
      {
        activityKey: "card-playground",
        routerPath: "/card-playground",
      },
    ]);
    subscriptions.push(
      Disposable.from(() => {
        store.unregisterItem(myCardsId);
        store.unregisterItem(createCardId);
        disconnect();
      })
    );
  },
};

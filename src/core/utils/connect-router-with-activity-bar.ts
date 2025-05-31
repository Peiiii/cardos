import { navigationStore } from "@/core/stores/navigation-store";
import { sidebarStore } from "@/core/stores/sidebar-store";

// const routerToActivityBarMap = {
//   "/": "home",
//   "/chat": "chat",
//   "/card": "card",
// };

// const activityBarToRouterMap = {
//   home: "/",
//   chat: "/chat",
//   card: "/card",
// };

export function createRouterToActivityBarMap(
  items: { activityKey: string; routerPath: string }[]
) {
  return items.reduce((acc, item) => {
    acc[item.routerPath] = item.activityKey;
    return acc;
  }, {} as Record<string, string>);
}

export function createActivityBarToRouterMap(
  items: { activityKey: string; routerPath: string }[]
) {
  return items.reduce((acc, item) => {
    acc[item.activityKey] = item.routerPath;
    return acc;
  }, {} as Record<string, string>);
}

export function mapRouterToActivityBar(
  routerToActivityBarMap: Record<string, string>
) {
  return navigationStore.subscribe((state, prevState) => {
    if (state.targetPath === prevState.targetPath) {
      return;
    }
    const currentPath = state.targetPath;
    if (currentPath) {
      const activityBarKey = routerToActivityBarMap[currentPath];
      if (activityBarKey) {
        sidebarStore.getState().setActiveItemKey(activityBarKey);
      }
    }
  });
}

export function mapActivityBarToRouter(
  activityBarToRouterMap: Record<string, string>
) {
  return sidebarStore.subscribe((state, prevState) => {
    if (state.activeItemKey === prevState.activeItemKey) {
      return;
    }
    const activeItemKey = state.activeItemKey;
    console.log("[mapActivityBarToRouter] [activeItemKey]", activeItemKey);
    if (activeItemKey) {
      const routerPath = activityBarToRouterMap[activeItemKey];
      if (routerPath) {
        navigationStore.getState().navigate(routerPath);
      }
    }
  });
}

/**
 * 连接路由和活动栏
 * @param items 路由和活动栏的映射关系
 * @returns 取消订阅函数
 */
export function connectRouterWithActivityBar(
  items: { activityKey: string; routerPath: string }[]
) {
  const routerToActivityBarMap = createRouterToActivityBarMap(items);
  const activityBarToRouterMap = createActivityBarToRouterMap(items);

  const unsubscribeRouter = mapRouterToActivityBar(routerToActivityBarMap);
  const unsubscribeActivityBar = mapActivityBarToRouter(activityBarToRouterMap);

  return () => {
    unsubscribeRouter();
    unsubscribeActivityBar();
  };
}

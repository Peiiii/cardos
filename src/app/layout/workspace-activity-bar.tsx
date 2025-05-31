import { useConnectKeyValueStorage } from "@/core/hooks/use-connect-key-value-storage";
import { NavItem, sidebarStore } from "@/core/stores/sidebar-store";
import { ActivityBar } from "@/shared/components/activity-bar";
import { LayoutDashboard } from "lucide-react";
import { useStore } from "zustand";

export function WorkspaceActivityBar() {
  const {
    topItems,
    bottomItems,
    collapsed,
    activeItemKey,
    setActiveItemKey,
    setCollapsed,
  } = useStore(sidebarStore);

  useConnectKeyValueStorage({
    key: "activityBar.collapsed",
    value: collapsed,
    onChange: setCollapsed,
  });

  useConnectKeyValueStorage({
    key: "activityBar.activeItemKey",
    value: activeItemKey,
    onChange: setActiveItemKey,
  });

  const renderItem = (item: NavItem) => {
    return (
      <ActivityBar.Item
        key={item.id}
        id={item.id}
        icon={<item.icon />}
        label={item.title}
        onClick={() => {
          item.onClick?.();
        }}
        notSelectable={item.notSelectable}
      />
    );
  };
  return (
    <ActivityBar.Root
      expanded={!collapsed}
      activeId={activeItemKey}
      onExpandedChange={() => setCollapsed(!collapsed)}
      onActiveChange={(activeId) => setActiveItemKey(activeId)}
      className="flex-shrink-0"
    >
      <ActivityBar.Header
        icon={<LayoutDashboard />}
        title="工作空间"
        showSearch={true}
      />

      <ActivityBar.Group>
        {topItems.map((item) => renderItem(item))}
      </ActivityBar.Group>
      <ActivityBar.Footer>
        <ActivityBar.Separator />
        <ActivityBar.Group>
          {bottomItems.map((item) => renderItem(item))}
        </ActivityBar.Group>
      </ActivityBar.Footer>
    </ActivityBar.Root>
  );
}

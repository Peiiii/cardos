"use client"

import * as React from "react"
import { Badge } from "@/shared/components/ui/badge"
import { ActivityBar } from "./activity-bar-namespace"

// 定义活动项配置类型
export interface ActivityItemConfig {
  id: string
  icon: React.ReactNode
  label: string
  badge?: React.ReactNode | string | number
  onClick?: (id: string) => void
  disabled?: boolean
}

// 定义活动组配置类型
export interface ActivityGroupConfig {
  title?: string
  items: ActivityItemConfig[]
}

// 定义头部配置类型
export interface ActivityHeaderConfig {
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>
  title: string
  showSearch?: boolean
}

// 定义完整配置类型
export interface ActivityBarConfig {
  header: ActivityHeaderConfig
  groups: ActivityGroupConfig[]
  footer?: ActivityGroupConfig
}

export interface ConfigurableActivityBarProps {
  config: ActivityBarConfig
  expanded?: boolean
  defaultExpanded?: boolean
  defaultActiveId?: string
  onExpandedChange?: (expanded: boolean) => void
  onActiveChange?: (activeId: string) => void
  className?: string
}

export function ConfigurableActivityBar({
  config,
  expanded: controlledExpanded,
  defaultExpanded = false,
  defaultActiveId,
  onExpandedChange,
  onActiveChange,
  className,
}: ConfigurableActivityBarProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const [activeId, setActiveId] = React.useState<string | undefined>(defaultActiveId)

  // 允许受控展开状态
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : expanded

  const handleExpandedChange = React.useCallback(
    (newExpanded: boolean) => {
      setExpanded(newExpanded)
      onExpandedChange?.(newExpanded)
    },
    [onExpandedChange],
  )

  const handleItemClick = React.useCallback(
    (id: string, onClick?: (id: string) => void) => {
      setActiveId(id)
      onActiveChange?.(id)
      onClick?.(id)
    },
    [onActiveChange],
  )

  // 处理徽章渲染
  const renderBadge = (badge: React.ReactNode | string | number) => {
    if (React.isValidElement(badge)) {
      return badge
    }
    if (typeof badge === "string" || typeof badge === "number") {
      return <Badge className="h-5 px-1.5 text-xs font-medium">{badge}</Badge>
    }
    return null
  }

  return (
    <ActivityBar.Root
      expanded={isExpanded}
      onExpandedChange={handleExpandedChange}
      className={className}
      activeId={activeId}
    >
      <ActivityBar.Header
        icon={config.header.icon}
        title={config.header.title}
        showSearch={config.header.showSearch}
      />

      <ActivityBar.GroupList>
      {config.groups.map((group, groupIndex) => (
          <ActivityBar.Group key={groupIndex} title={group.title}>
            {group.items.map((item) => (
              <ActivityBar.Item
                key={item.id}
                id={item.id}
                icon={item.icon}
                label={item.label}
                badge={item.badge ? renderBadge(item.badge) : undefined}
                onClick={() => handleItemClick(item.id, item.onClick)}
                aria-disabled={item.disabled}
                className={item.disabled ? "opacity-50 pointer-events-none" : ""}
              />
            ))}
          </ActivityBar.Group>
      ))}
      </ActivityBar.GroupList>

      {config.footer && (
        <ActivityBar.Footer>
          <ActivityBar.Separator />
          <ActivityBar.Group title={config.footer.title}>
            {config.footer.items.map((item) => (
              <ActivityBar.Item
                key={item.id}
                id={item.id}
                icon={item.icon}
                label={item.label}
                badge={item.badge ? renderBadge(item.badge) : undefined}
                onClick={() => handleItemClick(item.id, item.onClick)}
                aria-disabled={item.disabled}
                className={item.disabled ? "opacity-50 pointer-events-none" : ""}
              />
            ))}
          </ActivityBar.Group>
        </ActivityBar.Footer>
      )}
    </ActivityBar.Root>
  )
}

"use client"

import * as React from "react"
import { Separator } from "@/shared/components/ui/separator"
import { cn } from "@/shared/utils/utils"
import { ActivityBarComponent } from "./activity-bar-component"
import { ActivityGroup } from "./activity-group"
import { ActivityHeaderOptimized } from "./activity-header-optimized"
import { ActivityItem } from "./activity-item"
import { ActivityGroupList } from "./activity-group-list"
import { ActivityBarToggleButton } from "./activity-bar-toggle-button"

// 复合组件命名空间
export const ActivityBar = {
  Root: ActivityBarComponent,
  Header: ActivityHeaderOptimized,
  Group: ActivityGroup,
  Item: ActivityItem,
  Separator: ({ className }: { className?: string }) => (
    <div className="w-full px-2">
      <Separator className={cn("my-1", className)} />
    </div>
  ),
  Footer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("mt-auto", className)}>
      {children}
    </div>
  ),
  GroupList: ActivityGroupList,
  ToggleButton: ActivityBarToggleButton,
}

export type { ActivityBarProps } from "./activity-bar-component"
export type { ActivityBarToggleButtonProps } from "./activity-bar-toggle-button" 
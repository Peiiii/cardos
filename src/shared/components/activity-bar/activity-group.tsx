"use client"

import type * as React from "react"

import { cn } from "@/shared/utils/utils"
import { useActivityBar } from "./activity-bar-context"

export interface ActivityGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}

export function ActivityGroup({ className, title, children, ...props }: ActivityGroupProps) {
  const { expanded } = useActivityBar()

  return (
    <div className={cn("flex flex-col space-y-1 py-2", className)} {...props}>
      {title && (
        <div
          className={cn(
            "px-3 mb-1 transition-all duration-200 ease-in-out",
            expanded ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden",
          )}
        >
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  )
}

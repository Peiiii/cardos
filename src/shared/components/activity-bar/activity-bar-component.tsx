"use client"

import * as React from "react"

import { cn } from "@/shared/utils/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { ActivityBarContext } from "./activity-bar-context"
import { ActivityBarToggleButton } from "./activity-bar-toggle-button"

// 样式定义
export const activityBarVariants = cva(
  "flex flex-col h-full bg-background border-r transition-[width] duration-200 ease-in-out",
  {
    variants: {
      position: {
        left: "border-r",
        right: "border-l",
      },
      expanded: {
        true: "w-[240px]",
        false: "w-16",
      },
    },
    defaultVariants: {
      position: "left",
      expanded: false,
    },
  },
)

// 类型定义
export interface ActivityBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activityBarVariants> {
  defaultExpanded?: boolean
  activeId?: string
  toggleable?: boolean
  onExpandedChange?: (expanded: boolean) => void
  onActiveChange?: (activeId: string) => void
}

export type ActivityBarComponentProps = ActivityBarProps

export function ActivityBarComponent({
  className,
  position = "left",
  expanded: controlledExpanded,
  defaultExpanded = false,
  activeId,
  toggleable = true,
  onExpandedChange,
  onActiveChange,
  children,
  ...props
}: ActivityBarComponentProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
  const [innerActiveId, setInnerActiveId] = React.useState<string | undefined>(activeId)
  const isControlled = activeId !== undefined
  const finalActiveId = isControlled ? activeId : innerActiveId

  // Allow controlled expansion state
  const expanded = controlledExpanded ?? isExpanded

  React.useEffect(() => {
    if (isControlled) {
      setInnerActiveId(activeId)
    }
  }, [activeId, isControlled])

  const toggleExpanded = React.useCallback(() => {
    const newExpanded = !expanded
    setIsExpanded(newExpanded)
    onExpandedChange?.(newExpanded)
  }, [expanded, onExpandedChange])

  const handleActiveChange = React.useCallback((activeId: string) => {
    setInnerActiveId(activeId)
    onActiveChange?.(activeId)
  }, [onActiveChange])

  const contextValue = React.useMemo(
    () => ({
      expanded: expanded ?? false,
      activeId: finalActiveId,
      setActiveId: handleActiveChange,
    }),
    [expanded, finalActiveId, handleActiveChange],
  )

  return (
    <ActivityBarContext.Provider value={contextValue}>
      <div
        className={cn(
          activityBarVariants({ position, expanded }),
          "relative flex-col transition-all duration-200 ease-in-out",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0">{React.Children.toArray(children)[0]}</div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide min-w-0">
            <div className="w-full">{React.Children.toArray(children).slice(1, -1)}</div>
          </div>
          <div className="flex-shrink-0">{React.Children.toArray(children).at(-1)}</div>
        </div>
        {toggleable && (
          <ActivityBarToggleButton
            position={position as "left" | "right"}
            expanded={expanded ?? false}
            onClick={toggleExpanded}
          />
        )}
      </div>
    </ActivityBarContext.Provider>
  )
}
 
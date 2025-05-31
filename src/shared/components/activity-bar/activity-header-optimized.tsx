"use client"

import { Search } from "lucide-react"
import * as React from "react"

import { Input } from "@/shared/components/ui/input"
import { Separator } from "@/shared/components/ui/separator"
import { cn } from "@/shared/utils/utils"
import { useActivityBar } from "./activity-bar-context"

export interface ActivityHeaderOptimizedProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>
  title: string
  showSearch?: boolean
}

export function ActivityHeaderOptimized({
  className,
  icon,
  title,
  showSearch = true,
  ...props
}: ActivityHeaderOptimizedProps) {
  const { expanded } = useActivityBar()
  const [showContent, setShowContent] = React.useState(expanded)

  // 使用延迟显示/隐藏内容的技术
  React.useEffect(() => {
    let timeout: NodeJS.Timeout

    if (expanded) {
      // 当展开时，立即显示内容
      setShowContent(true)
    } else {
      // 当折叠时，等待过渡完成后再隐藏内容
      timeout = setTimeout(() => {
        setShowContent(false)
      }, 300) // 与过渡时间相匹配
    }

    return () => clearTimeout(timeout)
  }, [expanded])

  return (
    <div className={cn("overflow-hidden", className)} {...props}>
      {/* 标题区域 - 使用固定布局防止换行 */}
      <div className={
        cn("relative h-[52px] flex items-center px-3 mx-2")
      }>
        {/* 图标始终可见 */}
        <div className="flex-shrink-0 transition-all duration-300 ease-in-out">
          {React.isValidElement(icon) && React.cloneElement(icon, {
            className: cn("transition-all duration-300", expanded ? "h-5 w-5" : "h-6 w-6"),
          })}
        </div>

        {/* 标题文本容器 - 使用绝对定位防止影响布局 */}
        <div
          className={cn(
            "absolute left-[40px] transition-all duration-300 ease-in-out",
            "whitespace-nowrap overflow-hidden text-ellipsis",
            expanded ? "opacity-100 max-w-[180px]" : "opacity-0 max-w-0 pointer-events-none",
          )}
        >
          <span className="text-base font-semibold">{showContent ? title : ""}</span>
        </div>
      </div>

      <Separator className="transition-all duration-300 ease-in-out" />

      {/* 搜索框区域 - 使用 CSS Grid 技术平滑过渡高度 */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out overflow-hidden",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {showContent && showSearch && (
            <div className="px-3 py-3">
              <div className="flex items-center relative">
                <Search className="h-4 w-4 absolute left-2.5 text-muted-foreground" />
                <Input placeholder="搜索..." className="h-9 pl-8" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface ActivityBarToggleButtonProps {
  position: "left" | "right"
  expanded: boolean
  onClick: () => void
  className?: string
}

export function ActivityBarToggleButton({
  position,
  expanded,
  onClick,
  className,
}: ActivityBarToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute top-4 h-6 w-6",
        position === "left" ? "right-[-12px]" : "left-[-12px]",
        "rounded-full border bg-background shadow-sm z-50 hover:bg-accent hover:text-accent-foreground transition-all duration-200",
        className
      )}
      onClick={onClick}
      aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
    >
      {position === "left" ? (
        expanded ? (
          <ChevronLeft className="h-3 w-3 transition-transform duration-200" />
        ) : (
          <ChevronRight className="h-3 w-3 transition-transform duration-200" />
        )
      ) : expanded ? (
        <ChevronRight className="h-3 w-3 transition-transform duration-200" />
      ) : (
        <ChevronLeft className="h-3 w-3 transition-transform duration-200" />
      )}
    </Button>
  )
} 
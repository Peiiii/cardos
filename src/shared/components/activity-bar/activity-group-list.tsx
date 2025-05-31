"use client"

import * as React from "react"
import { ActivityBar } from "./activity-bar-namespace"

export interface ActivityGroupListProps extends React.HTMLAttributes<HTMLDivElement> {
  showSeparator?: boolean
}

export function ActivityGroupList({ 
  children, 
  className,
  showSeparator = true,
  ...props
}: ActivityGroupListProps) {
  const childrenArray = React.Children.toArray(children)
  
  return (
    <div className={className} {...props}>
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {showSeparator && index < childrenArray.length - 1 && <ActivityBar.Separator />}
        </React.Fragment>
      ))}
    </div>
  )
} 
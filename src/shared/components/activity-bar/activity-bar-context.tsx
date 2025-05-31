"use client"

import * as React from "react"

export interface ActivityBarContextValue {
  expanded: boolean
  activeId: string | undefined
  setActiveId: (id: string) => void
}

export const ActivityBarContext = React.createContext<ActivityBarContextValue | undefined>(undefined)

export function useActivityBar() {
  const context = React.useContext(ActivityBarContext)

  if (!context) {
    throw new Error("useActivityBar must be used within an ActivityBarProvider")
  }

  return context
}

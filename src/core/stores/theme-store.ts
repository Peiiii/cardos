import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeName = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'

interface ThemeState {
  mode: ThemeMode
  themeName: ThemeName
  setMode: (mode: ThemeMode) => void
  setThemeName: (themeName: ThemeName) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      themeName: 'default',
      setMode: (mode) => set({ mode }),
      setThemeName: (themeName) => set({ themeName }),
    }),
    {
      name: 'theme-storage',
    }
  )
) 
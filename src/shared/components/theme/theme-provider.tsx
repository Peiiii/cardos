import { useEffect } from 'react'
import { useThemeStore, ThemeName } from '../../../store/theme-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, themeName } = useThemeStore()
  
  // 处理模式（亮色/暗色）
  useEffect(() => {
    const root = window.document.documentElement
    
    // 移除所有模式类
    root.classList.remove('light', 'dark')
    
    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      
      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.add(mode)
    }
  }, [mode])
  
  // 处理颜色主题
  useEffect(() => {
    const root = window.document.documentElement
    
    // 移除所有主题类
    const themeNames: ThemeName[] = ['default', 'blue', 'green', 'purple']
    themeNames.forEach(name => {
      root.classList.remove(`theme-${name}`)
    })
    
    // 添加当前主题类
    root.classList.add(`theme-${themeName}`)
  }, [themeName])
  
  return <>{children}</>
} 
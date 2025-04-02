# CardOS 主题系统

## 概述

CardOS 采用基于 CSS 变量的主题系统，结合 Tailwind CSS 提供灵活且一致的视觉体验。这种方法允许动态主题切换（包括深色模式）同时保持代码简洁和可维护性。

## 设计原则

1. **语义化命名**：使用功能性命名而非直接颜色名
2. **主题一致性**：所有组件遵循统一的主题变量
3. **可扩展性**：支持多主题和自定义主题
4. **无缝切换**：在运行时无刷新切换主题

## 颜色变量定义

### CSS 变量

在根 CSS 文件中定义基础变量：

```css
:root {
  /* 主色调 */
  --color-primary: #3B82F6;
  --color-primary-foreground: #FFFFFF;
  
  /* 次要色调 */
  --color-secondary: #F3F4F6;
  --color-secondary-foreground: #111827;
  
  /* 强调色 */
  --color-accent: #10B981;
  --color-accent-foreground: #FFFFFF;
  
  /* 背景色 */
  --color-background: #FFFFFF;
  --color-foreground: #111827;
  
  /* 交互状态 */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* 边框 */
  --color-border: #E5E7EB;
  
  /* 输入 */
  --color-input: #F9FAFB;
  --color-input-foreground: #111827;
  
  /* 卡片 */
  --color-card: #FFFFFF;
  --color-card-foreground: #111827;
  
  /* 消息气泡 */
  --color-user-message: #DBEAFE;
  --color-user-message-foreground: #1E40AF;
  --color-ai-message: #F3F4F6;
  --color-ai-message-foreground: #111827;
}

.dark {
  /* 主色调 */
  --color-primary: #60A5FA;
  --color-primary-foreground: #000000;
  
  /* 次要色调 */
  --color-secondary: #374151;
  --color-secondary-foreground: #F9FAFB;
  
  /* 强调色 */
  --color-accent: #34D399;
  --color-accent-foreground: #000000;
  
  /* 背景色 */
  --color-background: #111827;
  --color-foreground: #F9FAFB;
  
  /* 交互状态 */
  --color-success: #34D399;
  --color-warning: #FBBF24;
  --color-error: #F87171;
  --color-info: #60A5FA;
  
  /* 边框 */
  --color-border: #374151;
  
  /* 输入 */
  --color-input: #1F2937;
  --color-input-foreground: #F9FAFB;
  
  /* 卡片 */
  --color-card: #1F2937;
  --color-card-foreground: #F9FAFB;
  
  /* 消息气泡 */
  --color-user-message: #1E40AF;
  --color-user-message-foreground: #DBEAFE;
  --color-ai-message: #374151;
  --color-ai-message-foreground: #F9FAFB;
}
```

## Tailwind 配置

在 `tailwind.config.js` 中引用 CSS 变量：

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主题颜色
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },
        
        // 基础颜色
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        
        // 状态颜色
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        
        // 组件颜色
        border: 'var(--color-border)',
        input: {
          DEFAULT: 'var(--color-input)',
          foreground: 'var(--color-input-foreground)',
        },
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },
        
        // 消息颜色
        message: {
          user: {
            DEFAULT: 'var(--color-user-message)',
            foreground: 'var(--color-user-message-foreground)',
          },
          ai: {
            DEFAULT: 'var(--color-ai-message)',
            foreground: 'var(--color-ai-message-foreground)',
          },
        },
      },
    },
  },
  plugins: [],
};
```

## 使用方法

### 组件中使用主题颜色

```tsx
// 错误示例 - 硬编码颜色
<div className="bg-blue-500 text-white">按钮</div>

// 正确示例 - 使用主题颜色
<div className="bg-primary text-primary-foreground">按钮</div>
```

### 状态相关颜色

```tsx
// 错误示例
<div className="bg-red-50 border-l-4 border-red-500 text-red-700">错误消息</div>

// 正确示例
<div className="bg-error/10 border-l-4 border-error text-error">错误消息</div>
```

### 消息气泡

```tsx
// 用户消息
<div className="bg-message-user text-message-user-foreground">
  用户消息内容
</div>

// AI消息
<div className="bg-message-ai text-message-ai-foreground">
  AI回复内容
</div>
```

## 主题切换

使用 Zustand 存储管理主题状态：

```tsx
// src/store/theme-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
```

主题提供者组件：

```tsx
// src/components/theme-provider.tsx
import { useEffect } from 'react'
import { useThemeStore } from '../store/theme-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()
  
  useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])
  
  return <>{children}</>
}
```

## 最佳实践

1. **始终使用语义化类名**，不直接使用颜色名称类（如`bg-blue-500`）
2. **避免内联样式**定义颜色，使用Tailwind类名
3. **遵循亮暗模式对比度**确保可访问性
4. **检查组件在两种模式下**的外观
5. **使用透明度变体**（如`bg-primary/10`）而非硬编码半透明颜色
6. **使用调试模式**检查颜色一致性：`localStorage.setItem('debug-colors', 'true')`

## 迁移指南

将现有代码从硬编码颜色转换为主题系统：

| 原始类名 | 主题系统类名 |
|---------|------------|
| `bg-blue-500` | `bg-primary` |
| `text-white` | `text-primary-foreground` |
| `bg-gray-100` | `bg-secondary` |
| `text-gray-800` | `text-secondary-foreground` |
| `bg-green-500` | `bg-success` |
| `bg-red-500` | `bg-error` |
| `bg-yellow-500` | `bg-warning` |
| `border-gray-200` | `border-border` |
| `bg-white` | `bg-background` |
| `text-gray-900` | `text-foreground` |
| `bg-gray-50` | `bg-input` |
| `text-blue-600` | `text-primary` |
| `border-blue-100` | `border-primary/20` | 
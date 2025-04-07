# CardOS 主题系统

## 概述

CardOS 采用基于 CSS 变量的主题系统，支持动态切换多个预定义主题。系统设计遵循以下原则：

1. **性能优先**：使用纯 CSS 变量实现主题切换，避免 JavaScript 运行时开销
2. **无缝切换**：主题切换时无闪烁，提供流畅的用户体验
3. **易于维护**：主题配置集中管理，便于扩展和修改
4. **类型安全**：使用 TypeScript 确保主题类型安全

## 文件组织

为了便于维护和扩展，主题文件采用以下组织方式：

```
src/styles/
├── themes/
│   ├── base.css        # 基础变量和通用样式
│   ├── default.css     # 默认主题
│   ├── blue.css        # 蓝色主题
│   ├── green.css       # 绿色主题
│   ├── purple.css      # 紫色主题
│   └── index.css       # 主题入口文件
└── index.css           # 全局样式入口
```

### 1. 基础变量 (base.css)

定义所有主题共享的基础变量和通用样式：

```css
/* 基础颜色变量 */
:root {
  /* 中性色 */
  --neutral-50: oklch(0.98 0 0);
  --neutral-100: oklch(0.95 0 0);
  --neutral-200: oklch(0.9 0 0);
  /* ... 其他中性色 */

  /* 功能色 */
  --success: oklch(0.6 0.15 150);
  --warning: oklch(0.6 0.15 80);
  --error: oklch(0.6 0.15 30);
  --info: oklch(0.6 0.15 250);

  /* 通用变量 */
  --border-radius: 0.5rem;
  --transition-duration: 200ms;
  /* ... 其他通用变量 */
}
```

### 2. 主题文件 (blue.css)

每个主题文件只包含该主题特有的变量：

```css
/* 蓝色主题变量 */
.theme-blue {
  /* 主色调 */
  --primary: oklch(0.6 0.15 250);
  --primary-foreground: oklch(0.98 0 0);
  
  /* 次要色调 */
  --secondary: oklch(0.95 0 0);
  --secondary-foreground: oklch(0.2 0 0);
  
  /* 强调色 */
  --accent: oklch(0.6 0.15 250);
  --accent-foreground: oklch(0.98 0 0);
  
  /* 背景色 */
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.2 0 0);
  
  /* 卡片 */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0 0);
  
  /* 输入 */
  --input: oklch(0.95 0 0);
  --input-foreground: oklch(0.2 0 0);
  
  /* 边框 */
  --border: oklch(0.9 0 0);
}
```

### 3. 主题入口文件 (themes/index.css)

导入所有主题文件：

```css
@import './base.css';
@import './default.css';
@import './blue.css';
@import './green.css';
@import './purple.css';
```

### 4. 全局样式入口 (index.css)

导入主题入口文件：

```css
@import './themes/index.css';

/* 其他全局样式 */
```

## 实现方案

### 1. 主题变量定义

更新后的主题变量定义方式：

```css
/* src/styles/themes/base.css */
:root {
  /* 基础变量定义 */
}

/* src/styles/themes/blue.css */
.theme-blue {
  /* 蓝色主题变量 */
}

/* src/styles/themes/green.css */
.theme-green {
  /* 绿色主题变量 */
}

/* src/styles/themes/purple.css */
.theme-purple {
  /* 紫色主题变量 */
}
```

### 2. 主题类型定义

在 `src/store/theme-store.ts` 中定义主题类型：

```typescript
export type ThemeName = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';

interface ThemeState {
  mode: ThemeMode;
  themeName: ThemeName;
  setMode: (mode: ThemeMode) => void;
  setThemeName: (themeName: ThemeName) => void;
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
);
```

### 3. 主题提供者

在 `src/shared/components/theme/theme-provider.tsx` 中实现主题切换：

```typescript
import { useEffect } from 'react';
import { useThemeStore, ThemeName } from '@/store/theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, themeName } = useThemeStore();
  
  // 处理显示模式（亮色/暗色）
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(mode);
    }
  }, [mode]);
  
  // 处理颜色主题
  useEffect(() => {
    const root = window.document.documentElement;
    
    // 移除所有主题类
    const themeNames: ThemeName[] = ['default', 'blue', 'green', 'purple', 'orange', 'red', 'yellow'];
    themeNames.forEach(name => {
      root.classList.remove(`theme-${name}`);
    });
    
    // 添加当前主题类
    root.classList.add(`theme-${themeName}`);
  }, [themeName]);
  
  return <>{children}</>;
}
```

## 使用方法

### 1. 组件中使用主题颜色

```tsx
// 使用主题变量
<div className="bg-primary text-primary-foreground">
  使用主题颜色的元素
</div>
```

### 2. 切换主题

```tsx
import { useThemeStore } from '@/store/theme-store';

function ThemeSwitcher() {
  const { themeName, setThemeName } = useThemeStore();
  
  return (
    <select value={themeName} onChange={(e) => setThemeName(e.target.value as ThemeName)}>
      <option value="default">默认</option>
      <option value="blue">蓝色</option>
      <option value="green">绿色</option>
      <option value="purple">紫色</option>
    </select>
  );
}
```

## 最佳实践

1. **始终使用语义化变量**：
   - 使用 `bg-primary` 而不是 `bg-blue-500`
   - 使用 `text-primary-foreground` 而不是 `text-white`

2. **避免硬编码颜色**：
   ```tsx
   // 错误示例
   <div className="bg-blue-500 text-white">
   
   // 正确示例
   <div className="bg-primary text-primary-foreground">
   ```

3. **使用透明度变体**：
   ```tsx
   // 错误示例
   <div className="bg-blue-500/10">
   
   // 正确示例
   <div className="bg-primary/10">
   ```

4. **保持颜色对比度**：
   - 确保文本颜色与背景色有足够的对比度
   - 在亮色和暗色模式下都测试可读性

## 主题扩展

要添加新主题：

1. 在 `ThemeName` 类型中添加新主题名
2. 创建新的主题文件 `src/styles/themes/[theme-name].css`
3. 在 `src/styles/themes/index.css` 中导入新主题文件

```typescript
// 1. 扩展主题类型
export type ThemeName = 'default' | 'blue' | 'green' | 'purple' | 'new-theme';

// 2. 创建新主题文件 src/styles/themes/new-theme.css
.theme-new {
  --primary: oklch(0.6 0.15 200);
  /* 其他变量... */
}

// 3. 在 themes/index.css 中导入
@import './new-theme.css';
```

## 调试技巧

1. 使用浏览器开发者工具检查 CSS 变量
2. 临时修改主题变量进行测试：
   ```css
   .theme-blue {
     --primary: red; /* 临时修改进行测试 */
   }
   ```
3. 使用 `localStorage.setItem('debug-theme', 'true')` 启用主题调试模式 
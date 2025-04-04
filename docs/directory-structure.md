# 项目目录结构

## 目录结构说明

```
src/
├── App.tsx                 # 应用入口
├── main.tsx                # 主入口
├── routes.tsx              # 路由配置
├── index.css               # 全局样式
│
├── shared/                 # 共享资源
│   ├── components/        # 基础 UI 组件
│   │   ├── ui/           # 基础 UI 组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── layout/       # 布局组件
│   │       ├── sidebar/
│   │       │   ├── sidebar.tsx
│   │       │   ├── sidebar-nav.tsx
│   │       │   └── sidebar-header.tsx
│   │       └── responsive/
│   │           ├── desktop-layout.tsx
│   │           └── mobile-layout.tsx
│   │
│   ├── hooks/             # 通用 hooks
│   │   ├── ui/           # UI 相关 hooks
│   │   │   ├── use-sidebar.ts
│   │   │   └── use-responsive.ts
│   │   ├── data/         # 数据相关 hooks
│   │   │   ├── use-auth.ts
│   │   │   └── use-theme.ts
│   │   └── utils/        # 工具类 hooks
│   │
│   ├── utils/            # 工具函数
│   │   ├── api/          # API 相关工具
│   │   │   ├── api.ts
│   │   │   └── request.ts
│   │   ├── dom/          # DOM 操作工具
│   │   │   └── dom-utils.ts
│   │   └── format/       # 格式化工具
│   │       └── format-utils.ts
│   │
│   └── plugins/          # 插件系统
│       ├── core/         # 内核
│       │   ├── registry.ts
│       │   └── types.ts
│       └── builtin/      # 内置插件
│           ├── theme/    # 主题插件
│           │   ├── index.ts
│           │   └── types.ts
│           └── sidebar/  # 侧边栏插件
│               ├── index.ts
│               └── types.ts
│
├── features/              # 功能模块
│   ├── chat/             # 聊天功能
│   │   ├── plugin/       # 聊天插件
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── components/   # 聊天相关组件
│   │   ├── hooks/       # 聊天相关 hooks
│   │   ├── services/    # 聊天相关服务
│   │   ├── types/       # 聊天相关类型
│   │   └── index.ts     # 模块入口
│   │
│   ├── card/             # 卡片功能
│   │   ├── plugin/       # 卡片插件
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── components/   # 卡片相关组件
│   │   ├── hooks/       # 卡片相关 hooks
│   │   ├── services/    # 卡片相关服务
│   │   ├── types/       # 卡片相关类型
│   │   └── index.ts     # 模块入口
│   │
│   └── settings/         # 设置功能
│       ├── plugin/       # 设置插件
│       │   ├── index.ts
│       │   └── types.ts
│       ├── components/   # 设置相关组件
│       ├── hooks/       # 设置相关 hooks
│       ├── services/    # 设置相关服务
│       ├── types/       # 设置相关类型
│       └── index.ts     # 模块入口
│
├── store/                 # 全局状态管理
│   ├── ui/               # UI 状态
│   │   ├── sidebar-store.ts
│   │   └── theme-store.ts
│   └── data/             # 数据状态
│
├── types/                 # 全局类型定义
│   ├── api/              # API 类型
│   │   ├── request.ts
│   │   └── response.ts
│   └── ui/               # UI 类型
│       ├── components.ts
│       └── theme.ts
│
└── pages/                # 页面路由
    ├── home.tsx
    ├── chat/
    │   ├── chat-view.tsx
    │   └── [id].tsx      # 动态路由
    ├── card/
    │   ├── card-view.tsx
    │   ├── create-card.tsx
    │   └── [id].tsx      # 动态路由
    └── settings/
        └── settings.tsx
```

## 目录说明

### shared/plugins/
插件系统目录，包含：
- core/: 内核
  - registry.ts: 插件注册表
  - types.ts: 核心类型定义
- builtin/: 内置插件
  - theme/: 主题插件
  - sidebar/: 侧边栏插件

### features/*/plugin/
功能插件目录，每个功能模块包含：
- index.ts: 插件入口
- types.ts: 插件类型定义

### features/
功能模块目录，每个功能模块包含：
- components/: 该功能特有的组件
- hooks/: 该功能特有的 hooks
- services/: 该功能特有的服务
- types/: 该功能特有的类型
- index.ts: 模块入口文件

### store/
全局状态管理目录，包含：
- ui/: UI 状态
- data/: 数据状态

### types/
全局类型定义目录，包含：
- api/: API 类型
- ui/: UI 类型

### pages/
页面路由目录，包含：
- 所有路由页面
- 按功能模块组织的子目录
- 动态路由页面

## 依赖方向
app -> shared/plugins/core -> shared/plugins/builtin -> features/*/plugin -> pages -> features -> shared

## 插件系统说明

### 内核（shared/plugins/core）
- 提供插件注册机制
- 定义核心类型
- 管理插件生命周期

### 内置插件（shared/plugins/builtin）
- 提供基础功能
- 随系统一起发布
- 不可卸载

### 功能插件（features/*/plugin）
- 提供特定功能
- 可动态加载/卸载
- 与功能模块对应

## 迁移指南

### 第一阶段：建立基础结构
1. 创建新的目录结构
2. 迁移共享资源到 shared
3. 建立全局状态管理

### 第二阶段：迁移功能模块
1. 将现有功能迁移到 features
2. 重构组件和 hooks
3. 更新类型定义

### 第三阶段：优化和文档
1. 完善模块边界
2. 编写文档
3. 建立代码规范

## 注意事项
1. 每个功能模块应该是完全独立的
2. 共享资源应该是最小化的
3. 全局状态应该是最小化的
4. 类型定义应该是最小化的
5. 遵循依赖方向

## 命名规范

1. **目录命名**
   - 使用小写字母
   - 多个单词用连字符连接
   - 例如：`message-list`, `card-preview`

2. **文件命名**
   - 组件文件使用 PascalCase
   - 工具文件使用 camelCase
   - 类型文件使用 PascalCase
   - 常量文件使用 UPPER_SNAKE_CASE

3. **组件命名**
   - 使用 PascalCase
   - 功能模块组件加前缀
   - 例如：`ChatMessage`, `CardPreview`

4. **Hook 命名**
   - 使用 camelCase
   - 以 use 开头
   - 例如：`useChat`, `useSidebar`

## 导入规范

1. **绝对路径导入**
   - 使用 @/ 别名
   - 例如：`import { Button } from '@/shared/components/ui/button'`

2. **相对路径导入**
   - 同一目录下使用相对路径
   - 例如：`import { Message } from './message'`

3. **导入顺序**
   - React 相关
   - 第三方库
   - 项目内部模块
   - 类型定义
   - 样式文件

## 注意事项

1. **代码组织**
   - 保持目录结构清晰
   - 避免过度嵌套
   - 遵循单一职责原则

2. **性能优化**
   - 合理使用代码分割
   - 优化导入路径
   - 控制包大小

3. **团队协作**
   - 保持一致的代码风格
   - 及时更新文档
   - 定期代码审查 
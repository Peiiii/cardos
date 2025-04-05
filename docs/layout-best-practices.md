# 布局组件最佳实践

## 布局组件的定位

### 1. 纯粹的结构性组件
- 只负责页面结构的组织和布局
- 不包含任何业务逻辑
- 不直接依赖任何业务模块

### 2. 职责边界
- 页面框架的搭建
- 响应式布局的处理
- 基础导航结构的提供
- 通用 UI 组件的组合

## 依赖关系

### 1. Layout 应该依赖什么
```
Layout
├── UI Components (Button, Card, etc.)
├── Hooks (useResponsive, useTheme, etc.)
└── Utils (cn, etc.)
```

### 2. Layout 不应该依赖什么
```
Layout
├── Features (❌)
├── Business Logic (❌)
├── API Calls (❌)
└── State Management (❌)
```

## 最佳实践示例

### 1. 定义清晰的接口
```typescript
interface LayoutProps {
  // 布局相关
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  
  // 样式相关
  className?: string;
  style?: React.CSSProperties;
  
  // 交互相关
  onScroll?: (event: React.UIEvent) => void;
}
```

### 2. 使用组合模式
```typescript
export function Layout({ header, sidebar, footer, children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      {header && <header>{header}</header>}
      <div className="flex flex-1">
        {sidebar && <aside>{sidebar}</aside>}
        <main className="flex-1">{children}</main>
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
```

### 3. 在业务模块中使用
```typescript
export function ChatPage() {
  return (
    <Layout
      header={<ChatHeader />}
      sidebar={<ChatSidebar />}
      footer={<ChatFooter />}
    >
      <ChatContent />
    </Layout>
  );
}
```

## 分层架构

```
src/
├── shared/           # 共享资源
│   ├── components/   # 通用组件
│   │   └── layout/   # 布局组件
│   │
│   ├── hooks/        # 通用 hooks
│   └── utils/        # 工具函数
│
├── features/         # 功能模块
│   ├── chat/         # 聊天功能
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── settings/     # 设置功能
│
└── pages/            # 页面组件
```

## 关键原则

### 1. 单一职责原则
- Layout 只负责布局
- 业务逻辑由功能模块处理

### 2. 依赖倒置原则
- Layout 不依赖具体实现
- 通过接口和组合实现解耦

### 3. 开闭原则
- Layout 对扩展开放
- 对修改关闭

### 4. 接口隔离原则
- 提供最小必要的接口
- 避免过度设计

## 实际应用建议

### 1. 布局组件设计
```typescript
// 基础布局
export function BaseLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}

// 带侧边栏的布局
export function SidebarLayout({ 
  sidebar, 
  children 
}: { 
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}
```

### 2. 业务模块使用
```typescript
// 在功能模块中组合
export function ChatLayout() {
  return (
    <BaseLayout>
      <SidebarLayout
        sidebar={<ChatSidebar />}
      >
        <ChatContent />
      </SidebarLayout>
    </BaseLayout>
  );
}
```

## 优势

1. 提高代码复用性
2. 降低维护成本
3. 便于测试
4. 支持更好的扩展性
5. 符合 SOLID 原则 
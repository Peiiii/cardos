# 布局组件实现方案

## 1. 设计原则

### 1.1 单一职责原则
- Layout 只负责布局结构
- 不包含任何业务逻辑
- 不直接依赖业务模块

### 1.2 依赖倒置原则
- Layout 不依赖具体实现
- 通过接口和组合实现解耦

### 1.3 开闭原则
- Layout 对扩展开放
- 对修改关闭

### 1.4 接口隔离原则
- 提供最小必要的接口
- 避免过度设计

## 2. 布局组件设计

### 2.1 基础布局组件

```typescript
// src/shared/components/layout/three-column-layout.tsx
interface ThreeColumnLayoutProps {
  children: React.ReactNode;
  leftPanel?: React.ReactNode;    // 左侧面板
  rightPanel?: React.ReactNode;   // 右侧面板
  className?: string;
}

export function ThreeColumnLayout({ 
  children, 
  leftPanel, 
  rightPanel,
  className 
}: ThreeColumnLayoutProps) {
  const { isMobile } = useResponsive();
  
  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-screen", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen", className)}>
      {/* 左侧面板 */}
      {leftPanel && (
        <div className="w-[250px] border-r border-border">
          {leftPanel}
        </div>
      )}
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      {/* 右侧面板 */}
      {rightPanel && (
        <div className="w-[400px] border-l border-border">
          {rightPanel}
        </div>
      )}
    </div>
  );
}
```

### 2.2 布局组件类型

1. **单列布局**
```typescript
interface SingleColumnLayoutProps {
  children: React.ReactNode;
  className?: string;
}
```

2. **双列布局**
```typescript
interface TwoColumnLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}
```

3. **三列布局**
```typescript
interface ThreeColumnLayoutProps {
  children: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  className?: string;
}
```

## 3. 页面组件实现

### 3.1 聊天页面示例
```typescript
// src/features/chat/pages/chat-view.tsx
export function ChatView() {
  const { conversationId } = useParams();
  const { data: cards } = useCards(conversationId || '');
  const { selectedConversation } = useConversations();
  
  return (
    <ThreeColumnLayout
      leftPanel={
        <ConversationList 
          conversations={conversations}
          selectedId={conversationId}
        />
      }
      rightPanel={
        <CardPreviewPanel cards={cards} />
      }
    >
      <ChatContent 
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </ThreeColumnLayout>
  );
}
```

### 3.2 卡片页面示例
```typescript
// src/features/card/pages/card-view.tsx
export function CardView() {
  const { cardId } = useParams();
  const { data: card } = useCard(cardId || '');
  
  return (
    <TwoColumnLayout
      sidebar={
        <CardList 
          cards={cards}
          selectedId={cardId}
        />
      }
    >
      <CardContent 
        card={card}
        onUpdate={handleUpdate}
      />
    </TwoColumnLayout>
  );
}
```

## 4. 布局提供者

### 4.1 基础实现
```typescript
// src/shared/components/layout/layout-provider.tsx
export function LayoutProvider() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
}
```

### 4.2 路由配置
```typescript
// src/pages/routes.tsx
const routes: RouteObject[] = [
  {
    path: '/',
    element: <LayoutProvider />,
    children: [
      {
        path: 'chat',
        element: <ChatView />
      },
      {
        path: 'card',
        element: <CardView />
      }
    ]
  }
];
```

## 5. 依赖关系

### 5.1 Layout 应该依赖什么
```
Layout
├── UI Components (Button, Card, etc.)
├── Hooks (useResponsive, useTheme, etc.)
└── Utils (cn, etc.)
```

### 5.2 Layout 不应该依赖什么
```
Layout
├── Features (❌)
├── Business Logic (❌)
├── API Calls (❌)
└── State Management (❌)
```

## 6. 目录结构

```
src/
├── shared/           # 共享资源
│   ├── components/   # 通用组件
│   │   └── layout/   # 布局组件
│   │       ├── single-column-layout.tsx
│   │       ├── two-column-layout.tsx
│   │       ├── three-column-layout.tsx
│   │       └── layout-provider.tsx
│   ├── hooks/        # 通用 hooks
│   └── utils/        # 工具函数
│
├── features/         # 功能模块
│   ├── chat/         # 聊天功能
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── card/         # 卡片功能
│       ├── components/
│       ├── pages/
│       └── hooks/
│
└── pages/            # 页面路由
```

## 7. 最佳实践

### 7.1 布局组件
- 使用通用命名（如 ThreeColumnLayout）
- 只提供布局结构
- 不包含业务逻辑
- 支持响应式设计

### 7.2 页面组件
- 选择合适的布局组件
- 注入业务组件
- 处理业务逻辑
- 管理数据状态

### 7.3 业务组件
- 专注于业务功能
- 可复用性强
- 状态管理清晰
- 接口定义明确

## 8. 优势

1. **关注点分离**
   - Layout: 只负责布局结构
   - Page: 处理业务逻辑
   - Components: 处理具体功能

2. **可维护性**
   - 布局组件可复用
   - 业务逻辑集中
   - 职责清晰

3. **灵活性**
   - 自由组合布局
   - 易于扩展
   - 支持响应式

4. **数据流清晰**
   - Page -> Layout -> Components
   - 状态管理集中
   - Props 传递明确 
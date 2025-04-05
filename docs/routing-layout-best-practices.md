# 路由与布局最佳实践

## 目录结构

```
src/
├── features/            # 功能模块
│   ├── chat/
│   │   ├── routes.tsx  # 功能路由
│   │   ├── pages/      # 功能页面
│   │   └── components/ # 功能组件
│   └── settings/
│       ├── routes.tsx
│       ├── pages/
│       └── components/
├── pages/              # 主页面
│   ├── routes.tsx      # 主路由配置
│   ├── chat.tsx        # 主页面组件
│   └── settings.tsx    # 主页面组件
└── shared/
    └── layout/         # 布局组件
```

## 依赖关系

```
routes (主) -> pages (主) -> layout (共享)
  ↑
routes (功能) -> pages (功能) -> components (功能)
```

## 布局与路由解耦方案

### 1. 使用布局提供者（推荐）

```typescript
// src/shared/components/layout/layout-provider.tsx
export function LayoutProvider() {
  const location = useLocation();
  const [layout, setLayout] = useState<React.ComponentType>(() => {
    // 根据路由路径初始化布局
    if (location.pathname.startsWith('/chat')) {
      return ChatLayout;
    }
    if (location.pathname.startsWith('/card')) {
      return CardLayout;
    }
    return MainLayout;
  });

  // 监听路由变化
  useEffect(() => {
    if (location.pathname.startsWith('/chat')) {
      setLayout(ChatLayout);
    } else if (location.pathname.startsWith('/card')) {
      setLayout(CardLayout);
    } else {
      setLayout(MainLayout);
    }
  }, [location.pathname]);

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      <RootLayout>
        <layout>
          <Outlet />
        </layout>
      </RootLayout>
    </LayoutContext.Provider>
  );
}

// src/pages/routes.tsx
const routes: RouteObject[] = [
  {
    path: '/',
    element: <LayoutProvider />,
    children: [
      {
        index: true,
        element: <Navigate to="/chat" replace />
      },
      {
        path: 'chat',
        children: [
          {
            index: true,
            element: <ChatView />
          },
          {
            path: ':conversationId',
            element: <ChatView />
          }
        ]
      }
    ]
  }
];
```

### 2. 使用布局 HOC

```typescript
// src/shared/components/layout/with-layout.tsx
export function withLayout(Layout: React.ComponentType) {
  return function LayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
      <RootLayout>
        <Layout>{children}</Layout>
      </RootLayout>
    );
  };
}

// src/pages/routes.tsx
const routes: RouteObject[] = [
  {
    path: '/',
    element: withLayout(RootLayout)(<Outlet />),
    children: [
      {
        path: 'chat',
        element: withLayout(ChatLayout)(<Outlet />),
        children: [
          {
            index: true,
            element: <ChatView />
          }
        ]
      }
    ]
  }
];
```

### 3. 使用布局上下文

```typescript
// src/shared/components/layout/layout-context.tsx
export const LayoutContext = createContext<{
  layout: React.ComponentType;
  setLayout: (layout: React.ComponentType) => void;
}>({
  layout: MainLayout,
  setLayout: () => {}
});

// src/pages/routes.tsx
const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <LayoutProvider>
        <Outlet />
      </LayoutProvider>
    ),
    children: [
      {
        path: 'chat',
        element: <ChatView />,
        loader: () => {
          // 在 loader 中设置布局
          useLayout().setLayout(ChatLayout);
          return null;
        }
      }
    ]
  }
];
```

## 最佳实践原则

### 1. 解耦原则
- 路由配置不应直接依赖具体布局
- 布局组件应作为独立资源
- 通过中间层管理布局选择

### 2. 单一职责
- 路由只负责路径匹配
- 布局只负责页面结构
- 页面只负责业务逻辑

### 3. 可维护性
- 布局逻辑集中管理
- 路由配置清晰简洁
- 支持动态布局切换

### 4. 扩展性
- 易于添加新的布局
- 支持布局的嵌套组合
- 便于布局的替换和修改

## 优势

1. **代码组织更清晰**
   - 职责划分明确
   - 依赖关系合理
   - 结构层次分明

2. **维护成本降低**
   - 布局变更不影响路由
   - 路由调整不影响布局
   - 修改范围可控

3. **开发效率提升**
   - 布局复用更方便
   - 路由配置更简单
   - 调试定位更容易

4. **扩展性更好**
   - 支持动态布局
   - 便于添加新功能
   - 适应需求变化 
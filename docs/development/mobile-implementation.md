# CardOS 移动端适配实施计划

## 1. 现有架构分析

### 1.1 核心组件
- `MainLayout`: 主布局容器
- `Sidebar`: 侧边栏导航
- `ChatArea`: 对话区域
- `CardPreview`: 卡片预览
- `Message`: 消息组件

### 1.2 技术栈
- React 18 + Vite
- Tailwind CSS
- shadcn/ui 组件库
- 基础状态管理（React useState）

## 2. 实现复杂度评估

### 2.1 低复杂度任务
- 响应式布局调整
  - 使用 Tailwind 的响应式类
  - 基础组件样式适配
  - 状态管理扩展（Zustand）

### 2.2 中等复杂度任务
- 移动端抽屉组件实现
- 消息卡片预览入口
- 手势处理集成

### 2.3 高复杂度任务
- 全屏卡片预览模式
- 虚拟列表优化
- 动画和过渡效果

## 3. 实施步骤

### 第一阶段：基础适配

#### 1. 添加响应式 Hook
```typescript
// src/hooks/use-responsive.ts
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet };
}
```

#### 2. 修改主布局组件
```typescript
// src/components/layout/main-layout.tsx
export function MainLayout({ children, className }: MainLayoutProps) {
  const { isMobile } = useResponsive();
  
  return (
    <div className={cn(
      "flex h-screen w-full overflow-hidden",
      isMobile ? "flex-col" : "flex-row",
      className
    )}>
      {children}
    </div>
  );
}
```

#### 3. 添加移动端抽屉组件
```typescript
// src/components/layout/mobile-drawer.tsx
export function MobileDrawer({ 
  isOpen, 
  onClose, 
  children 
}: MobileDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[80%] sm:w-[350px]">
        {children}
      </SheetContent>
    </Sheet>
  );
}
```

### 第二阶段：交互优化

#### 1. 添加手势处理
```typescript
// src/hooks/use-swipe.ts
export function useSwipe(
  onSwipeLeft?: () => void, 
  onSwipeRight?: () => void
) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
```

#### 2. 实现卡片预览入口
```typescript
// src/components/chat/message-card-preview.tsx
export function MessageCardPreview({ 
  card, 
  onPreview 
}: MessageCardPreviewProps) {
  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">卡片预览</span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onPreview(card)}
        >
          查看
        </Button>
      </div>
      <div className="mt-2 text-sm line-clamp-2">
        {card.content}
      </div>
    </div>
  );
}
```

#### 3. 添加动画效果
```typescript
// src/components/ui/transitions.tsx
export const slideTransition = {
  enter: "transform transition ease-out duration-300",
  enterFrom: "translate-x-full",
  enterTo: "translate-x-0",
  leave: "transform transition ease-in duration-300",
  leaveFrom: "translate-x-0",
  leaveTo: "translate-x-full",
};

export const fadeTransition = {
  enter: "transition-opacity duration-300",
  enterFrom: "opacity-0",
  enterTo: "opacity-100",
  leave: "transition-opacity duration-300",
  leaveFrom: "opacity-100",
  leaveTo: "opacity-0",
};
```

### 第三阶段：性能优化

#### 1. 实现虚拟列表
```typescript
// src/components/chat/virtual-message-list.tsx
export const VirtualMessageList = memo(({ messages }: MessageListProps) => {
  const { isMobile } = useResponsive();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <div ref={scrollRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <Message
            key={virtualRow.key}
            message={messages[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
});
```

#### 2. 优化状态管理
```typescript
// src/store/layout.ts
interface LayoutState {
  isMobile: boolean;
  isCardPreviewOpen: boolean;
  currentCardId: string | null;
  currentMessageId: string | null;
  isDrawerOpen: boolean;
}

const useLayoutStore = create<LayoutState>((set) => ({
  isMobile: window.innerWidth < 768,
  isCardPreviewOpen: false,
  currentCardId: null,
  currentMessageId: null,
  isDrawerOpen: false,
  // ... actions
}));
```

#### 3. 添加路由支持
```typescript
// src/routes/index.tsx
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'chat/:conversationId',
        element: <ChatView />,
      },
      {
        path: 'chat/:conversationId/card/:cardId',
        element: <CardPreviewView />,
      }
    ]
  }
];
```

## 4. 潜在风险

### 4.1 技术风险
- 现有组件可能需要重构以支持移动端交互
- 动画和手势可能需要额外的依赖
- 状态管理可能需要更复杂的逻辑

### 4.2 性能风险
- 移动端性能优化
- 大量消息时的渲染性能
- 动画流畅度

## 5. 优化建议

### 5.1 实施顺序
1. 先实现基础的响应式布局
2. 逐步添加移动端特有的交互
3. 最后进行性能优化

### 5.2 测试策略
- 单元测试：组件和 hooks
- 集成测试：页面交互
- 性能测试：渲染和动画
- 兼容性测试：不同设备和浏览器

### 5.3 监控指标
- 页面加载时间
- 交互响应时间
- 动画帧率
- 内存使用

## 6. 重构实施记录

### 6.1 组件结构重构
为了提高可维护性，我们将桌面端和移动端组件完全分离，创建了如下的目录结构：

```
src/
  components/
    layout/
      desktop/
        desktop-layout.tsx
        sidebar.tsx
        chat-area.tsx
        card-preview.tsx
      mobile/
        mobile-layout.tsx
        drawer.tsx
        chat-area.tsx
        card-preview.tsx
      layout.tsx (根据设备选择适用的布局)
```

### 6.2 已完成的工作
1. 创建了 `useResponsive` hook 用于检测设备类型
2. 创建了桌面端和移动端的独立组件
   - 桌面端保持原有的三栏布局
   - 移动端实现抽屉导航和全屏卡片预览
3. 在 `layout.tsx` 中根据设备类型渲染不同的布局
4. 更新了 `App.tsx` 以支持移动端路由

### 6.3 优势
- 各组件职责明确，无需条件渲染
- 代码可读性和可维护性更高
- 便于针对不同平台进行优化
- 更容易添加平台特定功能

### 6.4 后续工作
- 实现手势处理
- 添加消息卡片预览入口
- 实现虚拟列表优化
- 完善路由和状态管理 
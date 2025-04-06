# 聊天资源重构方案

## 1. 重构背景

当前 `chat-layout.tsx` 中的消息、对话和卡片资源存在以下问题：
1. 直接使用 mock 数据，没有统一的数据管理
2. 状态管理分散，使用多个 useState
3. 缺少错误处理和加载状态
4. 类型定义不完整
5. 业务逻辑和 UI 逻辑混合

## 2. 重构方案

### 2.1 分层架构实现

#### 2.1.1 Provider 层实现

```typescript
// src/shared/lib/storage/types.ts
interface DataProvider<T> {
  list(): Promise<T[]>;
  get(id: string): Promise<T>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// 实现：
// - MockHttpProvider
// - IndexedDBProvider
// - LocalStorageProvider
```

#### 2.1.2 Service 层实现

```typescript
// src/features/chat/services/message-service.ts
export class MessageService {
  constructor(
    private provider: MessageDataProvider,
    private resource: Resource<Message[]>
  ) {}
  
  async list(conversationId: string): Promise<Message[]> {
    return this.provider.list();
  }
  
  async create(content: string, conversationId: string): Promise<Message> {
    const message = await this.provider.create({
      content,
      isUser: true,
      timestamp: Date.now(),
      conversationId
    });
    
    // 触发资源更新
    await this.resource.mutate();
    
    return message;
  }
}
```

#### 2.1.3 Resource 层实现

```typescript
// src/features/chat/resources/index.ts
export const resources = {
  messages: createResource(
    (conversationId: string) => messageService.list(conversationId),
    {
      onCreated: (resource) => {
        // 自动同步逻辑
      }
    }
  ),
  
  conversations: createResource(
    () => conversationService.list(),
    {
      onCreated: (resource) => {
        // 自动同步逻辑
      }
    }
  )
};
```

#### 2.1.4 Hooks 层实现

```typescript
// src/features/chat/hooks/use-messages.ts
export function useMessages(conversationId: string) {
  const { data: messages, mutate } = useResourceState(resources.messages);
  const { optimisticUpdate } = useOptimisticUpdate(resources.messages);
  
  const sendMessage = async (content: string) => {
    await optimisticUpdate(
      (messages) => [...messages, { content, isUser: true }],
      () => messageService.create(content, conversationId)
    );
  };
  
  return {
    messages,
    sendMessage,
    // ... 其他操作
  };
}
```

#### 2.1.5 组件层实现

```typescript
// src/features/chat/components/chat-area.tsx
export function ChatArea() {
  const { messages, sendMessage } = useMessages(conversationId);
  
  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

### 2.2 重构步骤

#### 2.2.1 第一阶段：基础架构
1. 实现 Resource 模式核心
2. 添加乐观更新支持
3. 实现基础缓存机制

#### 2.2.2 第二阶段：服务层重构
1. 重构现有服务使用 Resource
2. 添加乐观更新支持
3. 实现自动同步

#### 2.2.3 第三阶段：Hooks 重构
1. 重构现有 hooks 使用 Resource
2. 添加乐观更新 hooks
3. 实现自动加载

#### 2.2.4 第四阶段：优化和测试
1. 添加性能监控
2. 实现完整测试
3. 优化缓存策略

### 2.3 完整重构方案

一次性重构所有组件，包括：
1. 创建完整的类型系统
2. 实现所有服务层
3. 创建所有自定义 hooks
4. 重构所有组件
5. 添加错误边界
6. 实现加载状态
7. 添加数据缓存

### 2.4 混合式重构方案

1. 保留现有 mock 数据
2. 逐步替换为真实服务
3. 保持向后兼容
4. 分阶段迁移

## 3. 最佳实践

### 3.1 类型安全

- 使用 TypeScript 严格模式
- 定义完整的接口
- 使用类型守卫

### 3.2 错误处理

- 统一的错误处理机制
- 友好的错误提示
- 错误重试机制

### 3.3 性能优化

- 使用 useMemo 和 useCallback
- 实现数据缓存
- 优化渲染性能

### 3.4 测试策略

- 单元测试服务层
- 组件测试
- 集成测试

### 3.5 文档维护

- 更新类型文档
- 添加使用示例
- 记录最佳实践

## 4. 推荐方案说明

推荐使用**渐进式重构**方案，原因如下：

1. **风险可控**
   - 可以逐步替换现有代码
   - 每个步骤都可以独立测试
   - 出现问题时容易回滚

2. **开发效率**
   - 不需要一次性重写所有代码
   - 可以边开发边测试
   - 不影响现有功能

3. **团队协作**
   - 可以分模块并行开发
   - 便于代码审查
   - 减少合并冲突 
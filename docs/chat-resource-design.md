# 聊天资源设计方案

## 1. 设计背景

在 `chat-layout.tsx` 中，我们需要对消息（Message）和卡片（Card）等资源进行封装，以提供更好的代码组织和可维护性。本文档将详细说明封装方案和最佳实践。

## 2. 架构设计

### 2.1 分层架构

采用清晰的分层架构，各层职责明确，依赖关系清晰：

```
页面组件 (Page Components)
    ↓
Hooks (useMessages, useConversations)
    ↓
Resource (MessageResource, ConversationResource)
    ↓
Service (MessageService, ConversationService)
    ↓
Provider (MockHttpProvider, IndexedDBProvider, LocalStorageProvider)
```

### 2.2 各层职责

#### 2.2.1 Provider 层
- 提供基础的数据存储和访问能力
- 支持多种存储实现（本地存储、HTTP、IndexedDB等）
- 处理数据持久化和序列化
- 提供统一的 CRUD 接口

#### 2.2.2 Service 层
- 封装业务逻辑
- 处理数据转换和验证
- 管理数据关系
- 提供高级操作接口

#### 2.2.3 Resource 层
- 管理异步状态
- 处理数据缓存
- 支持乐观更新
- 提供响应式更新机制

#### 2.2.4 Hooks 层
- 提供组件可用的状态和操作
- 处理组件生命周期
- 管理组件级状态
- 提供错误处理和加载状态

#### 2.2.5 组件层
- 处理 UI 渲染
- 响应用户交互
- 组合业务逻辑
- 提供用户体验

### 2.3 依赖关系

1. **Provider 层**
   - 不依赖其他层
   - 提供基础数据访问能力
   - 可以被多个 Service 复用

2. **Service 层**
   - 依赖 Provider 层
   - 不依赖 Resource 和 Hooks 层
   - 可以被多个 Resource 复用

3. **Resource 层**
   - 依赖 Service 层
   - 不依赖 Hooks 层
   - 可以被多个 Hooks 复用

4. **Hooks 层**
   - 依赖 Resource 层
   - 不依赖组件层
   - 可以被多个组件复用

5. **组件层**
   - 依赖 Hooks 层
   - 不依赖其他层
   - 专注于 UI 和交互

## 3. 目录结构设计

基于项目现有的目录结构，我们采用以下组织方式：

```
src/
├── features/              # 功能模块
│   ├── chat/             # 聊天功能
│   │   ├── plugin/       # 聊天插件
│   │   ├── components/   # 聊天相关组件
│   │   ├── hooks/       # 聊天相关 hooks
│   │   ├── services/    # 聊天相关服务
│   │   ├── types/       # 聊天相关类型
│   │   └── index.ts     # 模块入口
│   └── card/             # 卡片功能
│       ├── components/   # 卡片相关组件
│       ├── hooks/       # 卡片相关 hooks
│       ├── services/    # 卡片相关服务
│       ├── types/       # 卡片相关类型
│       └── index.ts     # 模块入口
```

## 4. 封装方案

### 4.1 完全分离式（推荐方案）

采用完全分离的封装方式，将消息和卡片作为独立的资源进行管理。

#### 4.1.1 类型定义

```typescript
// features/chat/types/message.ts
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  conversationId: string;
}

// features/chat/types/conversation.ts
export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  lastMessage?: string;
}

// features/card/types/card.ts
export interface Card {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  conversationId: string;
}
```

#### 4.1.2 服务层

```typescript
// features/chat/services/message-service.ts
export class MessageService {
  constructor(private provider: MessageDataProvider) {}
  // CRUD 操作
}

// features/chat/services/conversation-service.ts
export class ConversationService {
  constructor(private provider: ConversationDataProvider) {}
  // CRUD 操作
}

// features/card/services/card-service.ts
export class CardService {
  constructor(private provider: CardDataProvider) {}
  // CRUD 操作
}
```

#### 4.1.3 Hooks

```typescript
// features/chat/hooks/use-messages.ts
export function useMessages(conversationId: string) {
  // 消息相关的状态和操作
}

// features/chat/hooks/use-conversations.ts
export function useConversations() {
  // 对话相关的状态和操作
}

// features/card/hooks/use-cards.ts
export function useCards(conversationId: string) {
  // 卡片相关的状态和操作
}
```

### 4.2 组合式（备选方案）

将所有聊天相关的功能组合在一起：

```
features/
├── chat/
│   ├── services/
│   │   └── chat-service.ts       # 统一的消息和对话服务
│   ├── hooks/
│   │   └── use-chat.ts           # 统一的消息和对话 hooks
│   └── types/
│       └── chat.ts               # 统一的消息和对话类型
```

## 5. 最佳实践

### 5.1 存储配置

```typescript
// config/storage.ts
export const STORAGE_CONFIG = {
  KEYS: {
    MESSAGES: 'messages',
    CONVERSATIONS: 'conversations',
    CARDS: 'cards'
  },
  MOCK_DELAY_MS: 500
};
```

### 5.2 组件集成

在 `chat-layout.tsx` 中的使用示例：

```typescript
import { useMessages } from '@/features/chat/hooks/use-messages';
import { useConversations } from '@/features/chat/hooks/use-conversations';
import { useCards } from '@/features/card/hooks/use-cards';

export function ChatLayout() {
  const { messages, sendMessage } = useMessages(conversationId);
  const { conversations, selectConversation } = useConversations();
  const { currentCard } = useCards(conversationId);
  
  // 使用这些 hooks 处理业务逻辑
}
```

## 6. 方案对比

### 6.1 完全分离式

优点：
- 职责清晰，完全分离
- 便于维护和测试
- 符合单一职责原则
- 便于后续扩展

缺点：
- 需要更多的文件组织
- 可能存在一些重复代码

### 6.2 组合式

优点：
- 文件结构简单
- 相关功能集中管理
- 减少文件数量

缺点：
- 职责不够清晰
- 可能违反单一职责原则
- 不利于后续扩展

## 7. 推荐方案

基于项目现状和未来发展，推荐采用**完全分离式**方案，原因如下：

1. **类型定义分离**
   - 消息和卡片是完全不同的实体
   - 各自有不同的属性和行为
   - 分离的类型定义更清晰

2. **服务层分离**
   - 消息服务需要处理消息的 CRUD
   - 卡片服务需要处理卡片的 CRUD
   - 各自可能有不同的业务逻辑

3. **Hooks 分离**
   - 消息相关的 hooks 关注消息状态
   - 卡片相关的 hooks 关注卡片状态
   - 分离的 hooks 更容易复用

4. **存储配置**
   - 消息和卡片可能使用不同的存储策略
   - 可以独立配置存储选项
   - 便于后续切换存储实现

## 8. 后续优化方向

1. **性能优化**
   - 实现消息和卡片的懒加载
   - 添加缓存机制
   - 优化数据更新策略

2. **功能扩展**
   - 添加消息搜索功能
   - 实现卡片模板系统
   - 支持消息和卡片的批量操作

3. **用户体验**
   - 添加加载状态提示
   - 实现错误重试机制
   - 优化数据同步策略

## 9. Resource 实现说明

### 9.1 核心功能

```typescript
// 资源状态接口
interface ResourceState<T> {
  data: T | null;
  isLoading: boolean;    // 初始加载状态
  isValidating: boolean; // 刷新状态
  error: Error | null;
  mutate: (dataOrMutator?: T | null | ((prev: T | null) => T | null | Promise<T | null>), shouldRevalidate?: boolean) => Promise<void>;
}

// 资源选项
interface ResourceOptions<T> {
  minLoadingTime?: number; // 最小加载时间
  retryTimes?: number;     // 重试次数
  retryDelay?: number;     // 重试延迟
  onCreated?: (resource: ResourceManagerImpl<T>) => void;
}
```

#### 9.1.1 主要特性
- 状态管理：管理数据、加载状态和错误
- 数据获取：支持异步数据获取和缓存
- 自动重试：可配置的重试机制
- 加载控制：最小加载时间控制
- 订阅机制：支持状态变化订阅

### 9.2 乐观更新

```typescript
// 乐观更新 hook
function useOptimisticUpdate<T>(
  resource: Pick<ReadyResourceState<T>, 'data' | 'mutate'>,
  options: UseOptimisticUpdateOptions<T> = {}
) {
  // 实现乐观更新和错误回滚
}
```

#### 9.2.1 主要特性
- 乐观更新：立即更新 UI，后台执行操作
- 错误回滚：操作失败时自动回滚
- 自定义回调：支持更新后的回调处理

### 9.3 React 集成

#### 9.3.1 基础 Hook
```typescript
// 资源状态 Hook
function useResourceState<T>(resource: ResourceManagerImpl<T>): ReadyResourceState<T>

// 参数化资源 Hook
function useParameterizedResource<T, P>(
  resourceFactory: (params: P) => ResourceManagerImpl<T>,
  params: P | null,
  fallback: T | (() => T)
): ReadyResourceState<T>
```

#### 9.3.2 主要特性
- Suspense 支持：与 React Suspense 集成
- 状态管理：自动处理加载和错误状态
- 参数化支持：支持带参数的资源创建

### 9.4 使用示例

```typescript
// 创建资源
const messageResource = createResource(
  () => messageService.list(conversationId),
  {
    minLoadingTime: 500,
    retryTimes: 3,
    onCreated: (resource) => {
      // 资源创建后的初始化
    }
  }
);

// 在组件中使用
function ChatArea() {
  const { data: messages, mutate } = useResourceState(messageResource);
  const { optimisticUpdate } = useOptimisticUpdate(messageResource);

  const sendMessage = async (content: string) => {
    await optimisticUpdate(
      (messages) => [...messages, { content, isUser: true }],
      () => messageService.create(content, conversationId)
    );
  };

  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

### 9.5 最佳实践

1. **资源创建**
   - 使用 `createResource` 创建资源实例
   - 配置适当的重试和加载时间
   - 在 `onCreated` 中处理初始化逻辑

2. **状态管理**
   - 使用 `useResourceState` 获取资源状态
   - 使用 `mutate` 更新数据
   - 处理加载和错误状态

3. **乐观更新**
   - 使用 `useOptimisticUpdate` 实现乐观更新
   - 确保错误回滚逻辑正确
   - 处理并发更新

4. **性能优化**
   - 使用 `useParameterizedResource` 处理参数化资源
   - 合理配置缓存策略
   - 避免不必要的重新验证

## 10. Storage 模块说明

### 10.1 核心接口

```typescript
interface DataProvider<T> {
  list(): Promise<T[]>;
  get(id: string): Promise<T>;
  create(data: Omit<T, "id">): Promise<T>;
  createMany(data: Omit<T, "id">[]): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### 10.2 实现方式

#### 10.2.1 LocalStorageProvider
基于 `localStorage` 的实现，提供本地数据存储功能。

##### 特点
- 支持自定义排序
- 支持多字段排序
- 支持最大条目限制
- 自动生成唯一 ID
- 完整的事务性操作

##### 配置选项
```typescript
interface LocalStorageOptions<T> {
  maxItems?: number;
  comparator?: CompareFn<T>;
  sortFields?: SortField<T, keyof T>[];
}
```

#### 10.2.2 MockHttpProvider
基于 `LocalStorageProvider` 的实现，模拟 HTTP 接口。

##### 特点
- 模拟网络延迟
- 模拟 HTTP 错误处理
- 适用于开发和测试环境

##### 配置选项
```typescript
interface MockHttpOptions<T> extends LocalStorageOptions<T> {
  delay?: number;
}
```

#### 10.2.3 IndexedDBProvider
基于 IndexedDB 的实现，提供更强大的本地存储功能。

##### 特点
- 支持更大的存储空间（通常为 50MB 以上）
- 支持事务操作
- 支持索引查询
- 异步操作，不会阻塞主线程
- 支持结构化数据存储

##### 配置选项
```typescript
interface IndexedDBOptions {
  dbName?: string;    // 数据库名称
  version?: number;   // 数据库版本
  storeName?: string; // 对象存储名称
}
```

### 10.3 使用示例

```typescript
// 创建 Provider
const messageProvider = new LocalStorageProvider<Message>('messages', {
  maxItems: 1000,
  sortFields: [
    { field: 'timestamp', direction: 'desc' }
  ]
});

// 在 Service 中使用
class MessageService {
  constructor(private provider: DataProvider<Message>) {}

  async list(conversationId: string): Promise<Message[]> {
    const messages = await this.provider.list();
    return messages.filter(m => m.conversationId === conversationId);
  }

  async create(content: string, conversationId: string): Promise<Message> {
    return this.provider.create({
      content,
      isUser: true,
      timestamp: Date.now(),
      conversationId
    });
  }
}
```

### 10.4 最佳实践

1. **存储选择**
   - 开发环境：使用 `MockHttpProvider` 模拟后端接口
   - 生产环境：
     - 小数据量：使用 `LocalStorageProvider`
     - 大数据量：使用 `IndexedDBProvider`
     - 远程数据：使用实际的 HTTP 实现

2. **性能优化**
   - 合理使用排序功能提高数据访问效率
   - 批量操作时注意性能影响
   - 使用 `createMany` 进行批量创建

3. **错误处理**
   - 注意处理可能的错误情况
   - 对于 IndexedDB，注意处理数据库版本升级
   - 确保数据模型实现 `id` 字段

4. **数据安全**
   - 敏感数据不建议存储在本地
   - 注意存储空间限制：
     - localStorage: 通常为 5-10MB
     - IndexedDB: 通常为 50MB 以上

### 10.5 注意事项

1. **浏览器兼容性**
   - 不同浏览器对 IndexedDB 的支持程度可能不同
   - 需要处理浏览器不支持某些存储方式的情况

2. **数据同步**
   - 本地存储的数据需要与服务器保持同步
   - 考虑实现数据冲突解决策略

3. **性能考虑**
   - 大量数据操作时注意性能影响
   - 合理使用缓存策略
   - 避免频繁的存储操作

## 11. CRUD Resource Hook 设计

### 11.1 核心接口

```typescript
// 资源 Hook 选项
interface ResourceHookOptions<T> {
  minLoadingTime?: number;
  retryTimes?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
}

// 资源 Hook 结果
interface ResourceHookResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  mutate: (data: T | null) => Promise<void>;
  refresh: () => Promise<void>;
}

// CRUD 操作接口
interface CRUDOperations<T> {
  // 基础 CRUD
  create: (data: Omit<T, 'id'>) => Promise<T>;
  read: (id: string) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list: () => Promise<T[]>;
  
  // 批量创建
  createMany: (items: Omit<T, 'id'>[]) => Promise<T[]>;
}
```

### 11.2 实现说明

```typescript
// 使用 useMemoizedFn 优化所有方法
const create = useMemoizedFn(async (item: Omit<T, 'id'>) => {
  return optimisticUpdate(
    (items) => [...items, { ...item, id: 'temp' }],
    () => service.create(item)
  );
});

const createMany = useMemoizedFn(async (items: Omit<T, 'id'>[]) => {
  return optimisticUpdate(
    (currentItems) => [
      ...currentItems,
      ...items.map(item => ({ ...item, id: 'temp' }))
    ],
    () => service.createMany(items)
  );
});
```

### 11.3 使用示例

```typescript
// 服务实现
const service: CRUDOperations<Message> = {
  create: (data) => messageService.create(data, conversationId),
  read: (id) => messageService.get(id),
  update: (id, data) => messageService.update(id, data),
  delete: (id) => messageService.delete(id),
  list: () => messageService.list(conversationId),
  createMany: (items) => messageService.createMany(items, conversationId)
};

// Hook 使用
const { 
  data: messages, 
  createMany: sendMessages,
  isLoading,
  error
} = useCRUDResource(service);

// 批量操作
const handleBatchSend = async () => {
  const newMessages = [
    { content: '消息1', isUser: true },
    { content: '消息2', isUser: true },
    { content: '消息3', isUser: true }
  ];
  
  await sendMessages(newMessages);
};
```

### 11.4 最佳实践

1. **性能优化**
   - 使用 `useMemoizedFn` 优化所有方法
   - 合理配置 `minLoadingTime` 和 `retryTimes`
   - 使用乐观更新减少等待时间

2. **错误处理**
   - 统一处理错误情况
   - 提供错误回滚机制
   - 支持自定义错误处理

3. **类型安全**
   - 完整的 TypeScript 类型支持
   - 明确的接口定义
   - 类型推导支持

4. **使用建议**
   - 优先使用批量创建提高性能
   - 合理处理加载状态
   - 注意错误边界处理

## 12. 实现方案更新

### 12.1 目录结构

```
src/features/chat/
├── resources/
│   ├── messages.ts
│   ├── conversations.ts
│   └── index.ts
├── hooks/
│   ├── use-crud-resource.ts
│   ├── use-messages.ts
│   ├── use-conversations.ts
│   └── index.ts
├── services/
│   ├── message-service.ts
│   ├── conversation-service.ts
│   └── index.ts
└── types/
    ├── message.ts
    ├── conversation.ts
    └── index.ts
```

### 12.2 核心实现

```typescript
// src/features/chat/hooks/use-crud-resource.ts
export function useCRUDResource<T, P>(
  resourceFactory: (params: P) => ResourceManagerImpl<T>,
  params: P,
  fallback: T | (() => T),
  options: {
    onError?: (error: Error) => void;
    onSuccess?: (data: T) => void;
  } = {}
) {
  const { data, mutate } = useParameterizedResource(
    resourceFactory,
    params,
    fallback
  );

  const { optimisticUpdate } = useOptimisticUpdate(data, {
    onError: options.onError,
    rollbackOnError: true
  });

  const create = useMemoizedFn(async (item: Omit<T, 'id'>) => {
    return optimisticUpdate(
      (items) => [...items, { ...item, id: 'temp' }],
      () => service.create(item)
    );
  });

  const createMany = useMemoizedFn(async (items: Omit<T, 'id'>[]) => {
    return optimisticUpdate(
      (currentItems) => [
        ...currentItems,
        ...items.map(item => ({ ...item, id: 'temp' }))
      ],
      () => service.createMany(items)
    );
  });

  return {
    data,
    isLoading: !data,
    error: null,
    create,
    createMany,
    mutate,
    refresh: () => mutate()
  };
}
```

### 12.3 使用示例

```typescript
// src/features/chat/hooks/use-messages.ts
export function useMessages(conversationId: string) {
  return useCRUDResource<Message, string>(
    createMessagesResource,
    conversationId,
    [],
    {
      onError: (error) => {
        console.error('Message operation failed:', error);
      },
      onSuccess: (data) => {
        console.log('Message operation succeeded:', data);
      }
    }
  );
}
```

### 12.4 最佳实践

1. **资源管理**
   - 使用 `useCRUDResource` 统一管理 CRUD 操作
   - 支持参数化资源创建
   - 提供统一的错误处理

2. **性能优化**
   - 使用 `useMemoizedFn` 优化所有方法
   - 实现乐观更新减少等待时间
   - 支持批量操作提高性能

3. **类型安全**
   - 完整的 TypeScript 类型支持
   - 参数化资源类型推导
   - 操作结果类型安全

4. **错误处理**
   - 统一的错误处理机制
   - 支持自定义错误处理
   - 提供错误回滚机制

5. **代码组织**
   - 清晰的目录结构
   - 模块化的实现
   - 高内聚低耦合 
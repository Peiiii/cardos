# Resource 模式最佳实践

## 概述

Resource 模式是一种用于管理异步数据状态和操作的设计模式，它结合了单例模式、响应式编程和乐观更新等特性，提供了一种优雅的方式来处理前端应用中的数据流。

## 核心概念

### 1. Resource 定义

```typescript
interface ResourceState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isValidating: boolean;
}

interface Resource<T> {
  // 资源状态
  state: ResourceState<T>;
  
  // 核心方法
  reload(): Promise<void>;
  mutate(data: T): void;
  
  // 订阅状态变化
  subscribe(callback: (state: ResourceState<T>) => void): () => void;
}
```

### 2. 创建 Resource

```typescript
// 基础创建
const simpleResource = createResource(() => api.getData());

// 带配置的创建
const configuredResource = createResource(
  () => api.getData(),
  {
    onCreated: (resource) => {
      // 资源创建后的初始化逻辑
    },
    onDestroyed: () => {
      // 资源销毁时的清理逻辑
    }
  }
);
```

## 最佳实践

### 1. 资源组织

按领域组织资源，使用命名空间避免全局污染：

```typescript
// src/resources/index.ts
export const discussionsResource = {
  // 列表资源
  list: createResource<Discussion[]>(
    () => discussionService.listDiscussions(),
    {
      onCreated: (resource) => {
        // 自动创建首个会话
        resource.subscribe((state) => {
          if (!state.data?.length && !state.isLoading) {
            discussionService.createDiscussion("新会话")
              .then(() => resource.reload());
          }
        });
      }
    }
  ),

  // 当前会话资源
  current: createResource(
    async () => {
      const currentId = discussionControlService.getCurrentDiscussionId();
      return currentId ? discussionService.getDiscussion(currentId) : null;
    }
  )
};
```

### 2. 响应式更新

利用 RxJS 实现响应式数据流：

```typescript
export const discussionMembersResource = {
  current: createResource<DiscussionMember[]>(
    async () => {
      return firstValueFrom(
        discussionControlService.getCurrentDiscussionId$().pipe(
          filter(Boolean),
          switchMap(id => discussionMemberService.list(id))
        )
      );
    },
    {
      onCreated: (resource) => {
        return discussionControlService.onCurrentDiscussionIdChange$.listen(
          () => resource.reload()
        );
      }
    }
  )
};
```

### 3. 乐观更新

在 UI 层实现乐观更新，提升用户体验：

```typescript
function useDiscussions() {
  const resource = useResourceState(discussionsResource.list);
  
  const createDiscussion = async (title: string) => {
    return withOptimisticUpdate(
      // 乐观更新
      (discussions) => [
        ...discussions,
        {
          id: `temp-${Date.now()}`,
          title,
          createdAt: new Date()
        }
      ],
      // API 调用
      () => discussionService.createDiscussion(title)
    );
  };

  return {
    discussions: resource.data,
    createDiscussion
  };
}
```

### 4. 自动同步

实现资源间的自动同步：

```typescript
export const messagesResource = {
  current: createResource(
    () => {
      const currentId = discussionControlService.getCurrentDiscussionId();
      return currentId ? messageService.listMessages(currentId) : [];
    },
    {
      onCreated: (resource) => {
        // 监听会话切换，自动重新加载消息
        discussionControlService.onCurrentDiscussionIdChange$.listen(
          () => resource.reload()
        );
      }
    }
  )
};
```

## 使用场景

### 1. 列表管理

```typescript
function DiscussionList() {
  const { 
    discussions,
    createDiscussion,
    deleteDiscussion 
  } = useDiscussions();

  return (
    <div>
      {discussions?.map(discussion => (
        <DiscussionItem
          key={discussion.id}
          discussion={discussion}
          onDelete={() => deleteDiscussion(discussion.id)}
        />
      ))}
      <Button onClick={() => createDiscussion("新会话")}>
        创建会话
      </Button>
    </div>
  );
}
```

### 2. 数据同步

```typescript
function ChatView() {
  const { data: messages } = useResourceState(messagesResource.current);
  const { data: members } = useResourceState(discussionMembersResource.current);

  return (
    <div>
      <MemberList members={members} />
      <MessageList messages={messages} />
    </div>
  );
}
```

### 3. 初始化逻辑

```typescript
export const agentListResource = createResource(() =>
  agentService.listAgents().then(async (existingAgents) => {
    // 检查并更新预设 agents
    const agentUpdates = DEFAULT_AGENTS.map(async (defaultAgent) => {
      const existing = existingAgents.find(
        agent => agent.name === defaultAgent.name
      );

      if (!existing) {
        return agentService.createAgent(defaultAgent);
      }
      
      return agentService.updateAgent(existing.id, {
        ...defaultAgent,
        id: existing.id
      });
    });

    await Promise.all(agentUpdates);
    return agentService.listAgents();
  })
);
```

## 优势

1. **状态管理**
   - 集中管理异步状态
   - 自动处理加载状态
   - 统一的错误处理

2. **响应式**
   - 基于 RxJS 的响应式更新
   - 资源间自动同步
   - 声明式数据流

3. **性能优化**
   - 支持乐观更新
   - 自动缓存
   - 重复请求合并

4. **开发体验**
   - 简洁的 API
   - 类型安全
   - 易于测试

## 注意事项

1. **资源粒度**
   - 避免资源过于细粒度
   - 合理组织资源层级
   - 注意资源间依赖

2. **性能考虑**
   - 合理使用自动同步
   - 避免过度订阅
   - 及时清理订阅

3. **错误处理**
   - 统一的错误处理策略
   - 合理的重试机制
   - 友好的错误提示

4. **状态共享**
   - 避免重复创建资源
   - 合理使用资源缓存
   - 注意内存泄漏 
# 卡片通信抽象架构

## 概述

这个模块提供了一个极其简单、清晰、可扩展的卡片通信抽象架构，通过分层抽象完全解耦通信协议与业务逻辑。

## 🎯 设计目标

- **极简使用**: 组件无需了解任何通信细节
- **完全解耦**: 通信协议与业务逻辑完全分离  
- **可插拔架构**: 轻松切换不同通信实现
- **类型安全**: 完整的TypeScript支持
- **自动管理**: 自动处理卡片注册、引用管理等

## 🏗 架构分层

```
┌─────────────────────────────────┐
│     React组件层 (超简单使用)        │
├─────────────────────────────────┤
│  React Context Provider (封装)   │
├─────────────────────────────────┤
│    通信管理器接口 (可插拔)          │ 
├─────────────────────────────────┤
│   具体实现 (PostMessage/WebSocket) │
└─────────────────────────────────┘
```

## 🚀 极简使用方式

### 1. 在组件中使用（超级简单）

```typescript
// 只需要两步就能实现卡片通信！

// 第一步：在根组件提供通信上下文
export default function CardPlaygroundPage() {
  return (
    <CardCommunicationProvider 
      config={{ 
        manager: new PostMessageCommunicationManager(),
        autoRegister: true 
      }}
    >
      <YourCardContent />
    </CardCommunicationProvider>
  );
}

// 第二步：在子组件中使用
function YourCardContent() {
  const { registerCards } = useCardCommunication();
  const { highlightAllCards, alertCard } = useCardOperations();
  
  // 自动注册卡片 - 就这么简单！
  useEffect(() => {
    if (cardsData) {
      registerCards(cardsData);
    }
  }, [cardsData, registerCards]);
  
  // 发送消息 - 一行代码搞定！
  const handleHighlight = () => highlightAllCards('yellow');
  const handleAlert = () => alertCard(cardId, "Hello!");
  
  return (
    <div>
      <button onClick={handleHighlight}>高亮所有卡片</button>
      <button onClick={handleAlert}>发送消息</button>
    </div>
  );
}
```

### 2. 渲染卡片（自动处理iframe）

```typescript
function CardRenderer({ card }: { card: CardData }) {
  const { getIframeRef } = useCardCommunication();
  
  return (
    <iframe
      ref={getIframeRef(card.id)}  // 自动获取管理的ref
      srcDoc={card.htmlContent}
      title={card.title}
    />
  );
}
```

### 3. 监听消息（声明式）

```typescript
function MessageListener() {
  const { onMessage } = useCardCommunication();
  
  useEffect(() => {
    const unsubscribe = onMessage(CardEventType.USER_ACTION, (message) => {
      console.log('收到用户操作:', message);
    });
    return unsubscribe; // 自动清理
  }, [onMessage]);
  
  return null;
}
```

## 🔧 核心API

### `useCardCommunication()` - 基础通信Hook

```typescript
const {
  sendToCard,           // 发送消息给特定卡片
  broadcast,            // 广播消息给所有卡片  
  registerCards,        // 注册卡片列表（自动处理）
  onMessage,            // 监听来自卡片的消息
  getActiveCardCount,   // 获取活跃卡片数量
  getIframeRef         // 获取iframe引用（自动管理）
} = useCardCommunication();
```

### `useCardOperations()` - 高级操作Hook

```typescript
const {
  highlightAllCards,    // 高亮所有卡片
  alertCard,           // 向卡片发送警告
  updateCardDisplay,   // 更新卡片显示
  // ...包含所有基础API
} = useCardOperations();
```

## 🔌 可插拔通信实现

### 切换到WebSocket通信

```typescript
// 只需要改一行代码！
<CardCommunicationProvider 
  config={{ 
    manager: new WebSocketCommunicationManager('ws://localhost:8080')
  }}
>
```

### 切换到测试模式

```typescript
// 测试时使用Mock
<CardCommunicationProvider 
  config={{ 
    manager: new MockCommunicationManager()
  }}
>
```

## 📋 组件对比

### ❌ 之前的复杂用法

```typescript
function OldCardPlayground() {
  const [activeCards, setActiveCards] = useState([]);
  const messageBus = useMemo(() => new MessageBus(), []);
  const communicationManager = useMemo(() => new PostMessageCommunicationManager(), []);
  
  // 需要手动管理iframe refs
  useEffect(() => {
    const newActiveCards = cardsData.map((card) => ({
      ...card,
      iframeRef: React.createRef(),
    }));
    setActiveCards(newActiveCards);
  }, [cardsData]);
  
  // 需要手动注册卡片
  useEffect(() => {
    activeCards.forEach(card => {
      const cardInstance = new IFrameCardInstance(card.id, card.iframeRef);
      communicationManager.registerCard(cardInstance);
    });
  }, [activeCards]);
  
  // 需要手动设置消息监听
  useEffect(() => {
    const stopListening = communicationManager.startListening((message) => {
      messageBus.dispatch(message.eventType, message);
    });
    return stopListening;
  }, []);
  
  // 复杂的发送逻辑...
}
```

### ✅ 现在的极简用法

```typescript
function NewCardPlayground() {
  const { registerCards } = useCardCommunication();
  const { highlightAllCards } = useCardOperations();
  
  // 一行代码注册卡片
  useEffect(() => {
    if (cardsData) registerCards(cardsData);
  }, [cardsData, registerCards]);
  
  // 一行代码发送消息
  return <button onClick={() => highlightAllCards()}>高亮</button>;
}
```

## 🎨 扩展自定义通信

```typescript
class CustomCommunicationManager implements ICommunicationManager {
  // 实现接口方法
  startListening(onMessage: (message: CardToParentMessage) => void): () => void {
    // 自定义实现
  }
  // ... 其他方法
}

// 使用自定义实现
<CardCommunicationProvider config={{ manager: new CustomCommunicationManager() }}>
```

## 📈 对比优势

| 特性 | 旧方案 | 新方案 |
|------|--------|--------|
| 组件代码量 | 100+ 行 | 10-20 行 |
| 需要理解的概念 | 7个 | 2个 |
| 手动管理 | iframe refs, 注册, 监听 | 无 |
| 可插拔性 | 需要重写组件 | 改1行配置 |
| 类型安全 | 部分 | 完全 |
| 测试难度 | 困难 | 简单 |

## 🏆 最佳实践

1. **分层使用**: Provider负责配置，Hook负责操作
2. **自动清理**: 使用返回的unsubscribe函数
3. **类型安全**: 利用TypeScript的类型检查
4. **职责单一**: 每个Hook只负责特定功能
5. **可测试性**: 使用Mock实现进行单元测试

这个新架构真正实现了"简单易用、功能强大、完全解耦"的设计目标！🎉 
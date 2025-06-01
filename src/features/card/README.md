# 卡片通信模块

这个模块提供了卡片（iframe）与父页面之间的通信机制。它使用 `postMessage` API 实现安全的跨域通信，并提供了类型安全的接口。

## 主要功能

1. 类型安全的消息传递
2. 事件驱动的通信模式
3. 消息总线模式
4. 标准化的消息格式
5. 消息元数据支持

## 消息类型

### 卡片事件 (CardToParentMessage)

卡片可以向父页面发送以下类型的事件：

- `DATA_UPDATE`: 数据更新事件
- `STATE_CHANGE`: 状态变更事件
- `USER_ACTION`: 用户操作事件
- `ERROR`: 错误事件

### 父页面命令 (ParentToCardMessage)

父页面可以向卡片发送以下类型的命令：

- `UPDATE_DISPLAY`: 更新显示
- `TRIGGER_ACTION`: 触发操作
- `RELAY_EVENT`: 转发事件
- `HIGHLIGHT`: 高亮显示
- `ALERT`: 显示提示

## 使用示例

### 在卡片中发送消息

```typescript
// 创建消息
const message = MessageBuilder.createCardEvent(
  'card-123',
  CardEventType.DATA_UPDATE,
  { data: 'some data' }
);

// 发送消息到父页面
window.parent.postMessage(message, '*');
```

### 在父页面中接收消息

```typescript
// 创建消息总线
const messageBus = new MessageBus();

// 注册处理器
messageBus.registerHandler(CardEventType.DATA_UPDATE, (message) => {
  console.log('Received data update:', message.payload);
});

// 监听消息
window.addEventListener('message', (event) => {
  const messageData = event.data;
  if (isCardToParentMessage(messageData)) {
    messageBus.dispatch(messageData.eventType, messageData);
  }
});
```

### 向卡片发送命令

```typescript
// 创建命令
const command = MessageBuilder.createParentCommand(
  ParentCommandType.HIGHLIGHT,
  { color: 'yellow' }
);

// 发送命令到卡片
cardIframe.contentWindow.postMessage(command, '*');
```

## 消息格式

### 卡片事件消息

```typescript
interface CardToParentMessage<T = unknown> {
  type: 'cardEvent';
  metadata: {
    version: string;
    timestamp: number;
    messageId: string;
    correlationId?: string;
  };
  sourceCardId: string;
  eventType: CardEventType;
  payload: T;
}
```

### 父页面命令消息

```typescript
interface ParentToCardMessage<T = unknown> {
  type: 'parentCommand';
  metadata: {
    version: string;
    timestamp: number;
    messageId: string;
    correlationId?: string;
  };
  commandType: ParentCommandType;
  payload: T;
  originCardId?: string;
}
```

## 安全注意事项

1. 始终验证消息来源
2. 使用 `sandbox` 属性限制 iframe 权限
3. 验证消息格式和类型
4. 使用类型守卫确保类型安全
5. 避免在消息中包含敏感信息

## 最佳实践

1. 使用 `MessageBuilder` 创建消息，确保格式正确
2. 使用类型守卫验证消息
3. 实现错误处理和重试机制
4. 使用消息总线模式管理消息流
5. 保持消息处理器的职责单一
6. 使用 TypeScript 类型系统确保类型安全 
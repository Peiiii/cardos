# 通用多方通信框架

## 🎯 概述

这是一个完全通用的多方通信框架，完全解耦于具体的业务场景。它可以用于任何需要多个实体之间进行通信的场景，包括但不限于：

- 🃏 **卡片间通信** - iframe卡片之间的交互
- 🚀 **微前端通信** - 不同微应用之间的协调
- 🪟 **多窗口通信** - 浏览器窗口/标签页间通信  
- ⚡ **WebWorker通信** - 主线程与Worker的消息传递
- 🔌 **插件系统** - 宿主与插件的双向通信
- 📱 **组件通信** - React组件间的复杂通信

## 🏗 核心架构

### 层次结构
```
┌─────────────────────────────────────┐
│        业务适配层                     │  ← 具体业务的Hook和组件
├─────────────────────────────────────┤
│     React Provider层                │  ← CommunicationProvider
├─────────────────────────────────────┤  
│      通信管理器接口                   │  ← ICommunicationManager
├─────────────────────────────────────┤
│   具体通信实现 (可插拔)                │  ← PostMessage/WebSocket/Mock
└─────────────────────────────────────┘
```

### 核心概念

**🎭 角色定义**
- **协调器 (Coordinator)**: 中心管理者，负责消息分发和路由
- **节点 (Node)**: 通信参与者，可以发送和接收消息
- **管理器 (Manager)**: 负责具体的通信协议实现

**📨 消息流向**
```
节点A ──► 协调器 ──► 消息总线 ──► 业务处理 ──► 协调器 ──► 节点B/全部节点
```

## 🚀 快速开始

### 1. 基础使用

```typescript
import { 
  CommunicationProvider, 
  useCommunication,
  PostMessageCommunicationManager 
} from '@/shared/services/communication';

// 第一步：提供通信上下文
function App() {
    const manager = useMemo(() => new PostMessageCommunicationManager(), []);
  return (
    <CommunicationProvider config={{ 
      manager 
    }}>
      <YourComponents />
    </CommunicationProvider>
  );
}

// 第二步：使用通信
function YourComponent() {
  const { registerNodes, sendToNode, broadcast, onMessage } = useCommunication();
  
  // 注册通信节点
  useEffect(() => {
    registerNodes(nodeDataList, createYourNodeFactory);
  }, [nodeDataList]);
  
  // 发送消息
  const sendMessage = () => {
    sendToNode('node-1', { type: 'coordinatorCommand', /* ... */ });
  };
  
  // 监听消息
  useEffect(() => {
    const unsubscribe = onMessage('someEvent', (message) => {
      console.log('收到消息:', message);
    });
    return unsubscribe;
  }, []);
}
```

### 2. 创建自定义节点类型

```typescript
// 定义你的节点数据结构
interface MyNodeData extends NodeData {
  customProperty: string;
  // ... 其他属性
}

// 创建节点工厂
function createMyNode(nodeData: MyNodeData): NodeInstance {
  // 创建你的通信实现
  const communicationNode: CommunicationNode = {
    id: nodeData.id,
    send: (message) => {
      // 实现你的发送逻辑
      // 比如通过WebSocket、postMessage等
      return true;
    }
  };
  
  // 返回节点实例和相关资源
  return {
    communicationNode,
    resource: /* 任何你需要的资源，比如DOM引用 */
  };
}
```

## 📋 实际应用示例

### 卡片通信系统

```typescript
// 卡片特定的适配器
export function CardCommunicationProvider({ children }) {
  const manager = useMemo(() => new PostMessageCommunicationManager(), []);
  return (
    <CommunicationProvider config={{ 
      manager 
    }}>
      {children}
    </CommunicationProvider>
  );
}

export function useCardCommunication() {
  const communication = useCommunication();
  return {
    registerCards: (cards) => communication.registerNodes(cards, createIFrameCardNode),
    sendToCard: communication.sendToNode,
    // ... 其他卡片特定方法
  };
}
```

### 微前端通信系统

```typescript
// 微前端特定的适配器
export function MicroFrontendCommunicationProvider({ children }) {
  const manager = useMemo(() => new CustomEventCommunicationManager(), []);
  return (
    <CommunicationProvider config={{ 
      manager 
    }}>
      {children}
    </CommunicationProvider>
  );
}

export function useMicroAppCommunication() {
  const communication = useCommunication();
  return {
    registerApps: (apps) => communication.registerNodes(apps, createMicroAppNode),
    sendToApp: communication.sendToNode,
    // ... 其他微前端特定方法
  };
}
```

### WebWorker通信系统

```typescript
// WebWorker特定的适配器
export function WorkerCommunicationProvider({ children }) {
  const manager = useMemo(() => new WorkerCommunicationManager(), []);
  return (
    <CommunicationProvider config={{ 
      manager 
    }}>
      {children}
    </CommunicationProvider>
  );
}

export function useWorkerCommunication() {
  const communication = useCommunication();
  return {
    registerWorkers: (workers) => communication.registerNodes(workers, createWorkerNode),
    sendToWorker: communication.sendToNode,
    // ... 其他Worker特定方法
  };
}
```

## 🔌 可插拔通信实现

### PostMessage通信管理器
```typescript
const manager = new PostMessageCommunicationManager();
// 适用于：iframe、window通信
```

### WebSocket通信管理器
```typescript
const manager = new WebSocketCommunicationManager('ws://localhost:8080');
// 适用于：实时双向通信
```

### Mock通信管理器
```typescript
const manager = new MockCommunicationManager();
// 适用于：单元测试、开发调试
```

### 自定义通信管理器
```typescript
class CustomCommunicationManager implements ICommunicationManager {
  startListening(onMessage) { /* 实现监听逻辑 */ }
  registerNode(node) { /* 实现注册逻辑 */ }
  sendToNode(nodeId, message) { /* 实现发送逻辑 */ }
  broadcast(message) { /* 实现广播逻辑 */ }
  // ... 其他必需方法
}
```

## 🎨 扩展指南

### 创建新的业务适配器

1. **定义业务特定的数据结构**
```typescript
interface YourNodeData extends NodeData {
  // 你的业务特定字段
}
```

2. **实现节点工厂函数**
```typescript
function createYourNode(nodeData: YourNodeData): NodeInstance {
  // 实现你的通信节点
}
```

3. **创建业务特定的Provider**
```typescript
export function YourCommunicationProvider({ children }) {
  return (
    <CommunicationProvider config={{ manager: /* 选择合适的管理器 */ }}>
      {children}
    </CommunicationProvider>
  );
}
```

4. **创建业务特定的Hook**
```typescript
export function useYourCommunication() {
  const communication = useCommunication();
  return {
    // 包装通用API为业务特定API
  };
}
```

## 📈 架构优势

| 特性 | 传统方案 | 通用框架 |
|------|----------|----------|
| **业务耦合** | 紧耦合 | 完全解耦 |
| **协议切换** | 需重写 | 一行配置 |
| **代码复用** | 难以复用 | 高度复用 |
| **测试难度** | 困难 | 简单 |
| **扩展性** | 有限 | 无限 |
| **维护成本** | 高 | 低 |

## 🏆 最佳实践

1. **分层设计**: 通用框架 + 业务适配器
2. **接口优先**: 基于接口编程，而非具体实现
3. **依赖注入**: 通过配置注入不同的通信实现
4. **类型安全**: 充分利用TypeScript的类型系统
5. **资源管理**: 自动处理资源的创建和清理
6. **错误处理**: 优雅处理通信失败的情况

## 🔮 未来扩展

这个框架可以轻松扩展支持：

- 🌐 **跨域通信** - 不同域之间的安全通信
- 📡 **P2P通信** - 点对点直连通信
- 🔄 **消息队列** - 可靠的异步消息传递
- 🛡️ **权限控制** - 基于角色的通信权限
- 📊 **监控统计** - 通信性能和质量监控
- 🔐 **加密传输** - 端到端加密的安全通信

这个通用框架真正实现了"一次设计，处处可用"的目标！🎉 